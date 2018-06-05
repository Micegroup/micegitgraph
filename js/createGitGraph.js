
//IMPORTANTE
//controllare sempre la versione delle api, nel caso cambiarla in "urlProject"

var username;
var password;
var branches = new Array(); //memorizzazione branches
var private_token;
var urlProject
var urlGetProject;

function createGitgraph(baseUrl, nomeProgetto, versione, _username, _password) {

	urlProject = baseUrl + "/api/" + versione;
	var idProject;
	username = _username;
	password = _password


	console.log("INIT CREATE GITGRAPH")

	if (username != undefined && password != undefined) {
		console.log("AJAX GET TOKEN....")
		$.ajax({ // chiamata POST per ricevere il token
			type: "POST",
			url: urlProject + "/session?login=" + username + "&password=" + password,
			success: function (data) {
				//salvo il token per le chiamate future
				private_token = data.private_token;
				urlGetProject = urlProject + "/projects?search=" + nomeProgetto + "&private_token=" + private_token;
				main();

			} // END chiamata per il token
		});

	} // end if username e password ok
	else {
		urlGetProject = urlProject + "/projects?search=" + nomeProgetto;
		main();
	}

} // END function createGitgraph



function main() {
	$.ajax({ // ricevo le informazione del progetto
		url: urlGetProject,
		success: function (data) {
			idProject = data[0].id;

			if (username != undefined && password != undefined) {
				var urlGetBranches = urlProject + "/projects/" + idProject + "/repository/branches?private_token=" + private_token;

				//per_page	Numero di elementi da elencare per pagina (default: 20, max: 100)
				var urlGetMergeRequest = urlProject + "/projects/" + idProject + "/merge_requests?state=merged&per_page=21&private_token=" + private_token;
			}
			else {
				var urlGetBranches = urlProject + "/projects/" + idProject + "/repository/branches";

				//per_page	Numero di elementi da elencare per pagina (default: 20, max: 100)
				var urlGetMergeRequest = urlProject + "/projects/" + idProject + "/merge_requests?state=merged&per_page=100";
			}
			var graphConfig = new GitGraph.Template({
				branch: {
					color: "#000000",
					lineWidth: 3,
					spacingX: 60,
					mergeStyle: "straight",
					showLabel: true,                // display branch names on graph
					labelFont: "normal 10pt Arial",
					labelRotation: 0
				},
				commit: {
					spacingY: -30,
					dot: {
						size: 8,
						strokeColor: "#000000",
						strokeWidth: 4
					},
					tag: {
						font: "normal 10pt Arial",
						color: "yellow"
					},
					message: {
						color: "black",
						font: "normal 12pt Arial",
						displayAuthor: false,
						displayBranch: false,
						displayHash: false,
					}
				},
				arrow: {
					size: 8,
					offset: 3
				}
			});

			var config = {
				template: graphConfig,
				mode: "extended",
				orientation: "horizontal"
			};

			var bugfixCommit = {
				messageAuthorDisplay: false,
				messageBranchDisplay: false,
				messageHashDisplay: false,
				message: "Bug fix commit(s)"
			};

			var stablizationCommit = {
				messageAuthorDisplay: false,
				messageBranchDisplay: false,
				messageHashDisplay: false,
				message: "Release stablization commit(s)"
			};


			var gitgraph = new GitGraph(config);


















			branches.push(gitgraph.branch("master")); //creo la branche e la inserisco nell'array
			branches.find(x => x.name == "master").commit({
				author: "dario.telese@micegroup.it", //oggetto contenente i dati dell'autore
				column: 0,          // indice della riga su cui visualizzare questa branches
				onClick: function (commit) {
					console.log("Oh, you clicked my commit?!", commit);
				}
			});

			console.log("GET BRANCHES....")
			$.ajax({ //chiamata per gli BRANCHES
				url: urlGetBranches,
				success: function (data) {
					console.log("in BRANCHES....")
					data.forEach(element => {
						if (element.name == "master") {
							return null;
						}
						else {
							branches.push(branches[0].branch(element.name));
							branches.find(x => x.name == element.name).commit()
						}
					});

					console.log("GET MERGE REQUEST...")



					$.ajax({
						url: urlGetMergeRequest,
						success: function (data) {

							data = data.reverse(); //riordiniamo per creare il grafico in ordine da sinistra a destra(dal più vecchio al nuovo)
							console.log(data)
							data.forEach(element => {
								var source = branches.find(x => x.name == element.source_branch);
								var target = branches.find(x => x.name == element.target_branch);

								if (source != undefined && target != undefined) {

									source.merge(target, {										
										author: element.author.username,
										onClick: function (commit) {
											console.log("Oh, you clicked my commit?!", commit);
											alert("Title: " + element.title + "\n" +
												"Message: " + commit.message + "\n" +
												"Author : " + commit.author + "\n" +
												"Date: " + commit.date);
										}
									})
								}
							}) //end forEach
						} //end success
					}) //end chiamata ajax merge request
				}//end success chiamata per le branches				
			}); // chiamata ajax per gli BRANCHES
		}//END success chiamata per le informazioni del progetto
	}); // END ajax chiamata per le informazioni del progetto



} // main

