var apiKey = "24Ll8O2B5ThluldDxFMYc2waky7TnCoMPrmYkMgavRUxtSYU6S1p3QJ3xrC8",
	url,
	socket,
	palavra,
	regex = /^[A-Za-záàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]+$/,
	senha,
	comando,
	info,
	detect,
	chute,
	teclas = document.getElementsByClassName("tecla"),
	descoberto,
	erros = 0;

function conectar(){
	url = "wss://connect.websocket.in/v3/1?apiKey="+apiKey;
	socket = new WebSocket(url);

	socket.onmessage = recebido;
	socket.onerror = problema;
}

function recebido(event){
	info = event.data.toString();
	detect = info.slice(0,3);

	switch(detect){
		case "pal":
			palavra = info.slice(3);
			break;
		case "sen":
			senha = info.slice(3);
			break;
		case "des":
			descoberto = info.slice(3);
			mostrar();
			break;
		case "chu":
			chute = info.slice(3);
			marcar();
			break;
		case "com":
			comando = info.slice(3);
			switch(comando){
				case "habilitar":
					chute=0;
					erros=0;
					document.getElementById("forca").style.backgroundImage = "url('forca/0.png')";
					document.getElementById("resultado").innerHTML = "";
					document.getElementById("palavra").innerHTML = "";
					document.getElementById("botoes").innerHTML = "<button onclick='finalizar(3);' id='jogar'>Desistir</button>";
					for(var i=0; i<27; i++){
						teclas[i].disabled = false;
						teclas[i].style = "";
					}
					document.getElementById("chutar").innerHTML = "Selecionar e Chutar!";
					document.getElementById("chutar").style.backgroundColor = "rgba(221, 102, 232, 0.6)";
					break;
				case "finalizar5":
					finalizar(5);
					break;
				case "finalizar6":
					finalizar(6);
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}
}

function problema(){
	alert("Houve um erro ao comunicar-se com o servidor.");
}

function letra(atual){
	if(chute != 0){
		document.getElementById(chute).style="";
	}
	chute = atual;
	document.getElementById(atual).style.backgroundColor = "rgba(221, 102, 232, 0.6)";
}

function chutar(){
	if(chute != 0){
		for(var i=0; i<senha.length; i++){
			if(chute==senha[i]){
				descoberto = descoberto.slice(0,i)+palavra[i]+descoberto.slice(i+1);
			}
		}
		socket.send("des"+descoberto);
		socket.send("chu"+chute);
		mostrar();
		marcar();
	}
}

function marcar(){
	if(chute != 0){
		for(var i=0; i<senha.length; i++){
			if(chute==senha[i]){
				document.getElementById(chute).disabled=true;
				document.getElementById(chute).style.border="2px solid black";
				document.getElementById(chute).style.backgroundColor="green";
				chute = 0;
				acertado();
			}
		}
		if(chute!=0){
			document.getElementById(chute).disabled=true;
			document.getElementById(chute).style.border="2px solid black";
			document.getElementById(chute).style.backgroundColor="red";
			chute = 0;
			errado();
		}

	}
}

function acertado(){
	if(/[_]/g.test(descoberto) == false){
		finalizar(1);
	}
}

function errado(){
	erros+=1;
	document.getElementById("forca").style.backgroundImage = "url(forca/"+erros+".png)";
	if(erros==6){
		finalizar(2);
	}
}

function jogar(){
	chute=0;
	erros=0;
	document.getElementById("forca").style.backgroundImage = "url('forca/0.png')";

	palavra = prompt("Escolha a palavra para a forca!");
	while (regex.test(palavra) == false || palavra == null || palavra.length<3){
		palavra = prompt("Escolha uma palavra para a forca com:\n* 3 caracteres ou mais;\n* Sem caracteres especiais;\n* Sem números;\n* Sem espaços!");
	}
	palavra = palavra.slice(0,1).toUpperCase()+palavra.slice(1).toLowerCase();
	if(confirm("Você escolheu: "+palavra+".\nCorreto?")==false){
		if(confirm("Inserir nova palavra?")){
			jogar();
		}
	}
	else{
		for(var i=0; i<27; i++){
			teclas[i].style = "";
		}
		socket.send("com"+"habilitar");
		socket.send("pal"+palavra);
		acentuacao();
		socket.send("sen"+senha);
		cobrir();
		socket.send("des"+descoberto);
		mostrar();
		document.getElementById("palavra").innerHTML = "Sua palavra: "+palavra;
		document.getElementById("chutar").innerHTML = "Agora o outro jogador tentará adivinha sua palavra!";
		document.getElementById("botoes").innerHTML = "<button onclick='finalizar(4);' id='jogar'>Desistir</button>";
	}
}

function acentuacao(){
	senha = palavra.toLowerCase();
	senha = senha.replace(/[áàâãä]/g, "a");
	senha = senha.replace(/[éèêë]/g, "e");
	senha = senha.replace(/[íìîï]/g, "i");
	senha = senha.replace(/[óòôõö]/g, "o");
	senha = senha.replace(/[úùûü]/g, "u");
	senha = senha.replace(/[ç]/g, "c");
}

function cobrir(){
	descoberto = palavra.replace(/[A-Za-záàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]/g, "_");
}

function mostrar(){
	document.getElementById("resultado").innerHTML="Palavra: ";
	for(var i=0; i<descoberto.length; i++){
		document.getElementById("resultado").innerHTML+=descoberto[i]+" ";
	}
}

function finalizar(tipo){
	if(tipo==1){
		document.getElementById("forca").style.backgroundImage = "url('imgs/stickmanbadass.gif')";
		document.getElementById("resultado").innerHTML = "O Stickman vive! Vitória dos adivinhadores!";
	}
	else if(tipo==2){
		document.getElementById("resultado").innerHTML = "O Stickman se foi. Derrota dos adivinhadores.";
	}
	else if(tipo==3){
		socket.send("com"+"finalizar5");
		finalizar(5);
	}
	else if(tipo==4){
		socket.send("com"+"finalizar6");
		finalizar(6);
	}
	else if(tipo==5){
		document.getElementById("resultado").innerHTML = "Desistência dos adivinhadores!";
		document.getElementById("forca").style.backgroundImage = "url('imgs/stickmankick.gif')";
	}
	else if(tipo==6){
		document.getElementById("resultado").innerHTML = "Desistência do palavreador!";
		document.getElementById("forca").style.backgroundImage = "url('imgs/stickmankick.gif')";
	}
	for(var i=0; i<27; i++){
		teclas[i].disabled = true;
	}
	document.getElementById("palavra").innerHTML = "A palavra era: "+palavra;
	document.getElementById("chutar").innerHTML = "Fim do jogo!";
	document.getElementById("chutar").style = "";
	document.getElementById("botoes").innerHTML = "<button onclick='jogar();' id='jogar'>Iniciar nova rodada</button>";
}