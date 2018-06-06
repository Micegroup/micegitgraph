
//IMPORTANT
//check always Api version

var gitgraph;
var branches = new Array(); //save branches 
var nameProject;
var urlBase;
var login; // variable to create url with or without token
var headers;//for ajax call


//function to create gitgraph base and to call Api for save token if there are username and password
function createGitgraph(url, version, username, password) {

	console.log(url)


	// splite url for api
	var n = url.indexOf("/",9)
	urlBase = url.substring(0,n);
	nameProject = url.substring(n+1,url.lenght)
	nameProject = nameProject.replace(/\//g,"%2F");
	nameProject = nameProject.replace(".git",'')

	urlApi = urlBase + "/api/" + version;

	console.log("INIT CREATE GITGRAPH")

	//custom gitGraph template
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
	gitgraph = new GitGraph(config);


	//save token by api
	if (username != undefined && password != undefined) {
		login = true;
		console.log("AJAX GET TOKEN....")
		$.ajax({
			type: "POST",
			url: urlBase + "/oauth/token",
			data: {
				"grant_type": "password",
				"username": username,
				"password": password
			},
			success: function (data) {
				headers = { 'Authorization': 'Bearer ' + data.access_token }
				main();

			}
		});

	}
	else {
		login = false;
		headers = null
		main();
	}

} // END function createGitgraph


//function that calls API gitLab and create dynamically node of graph
function main() {

	//creazione degli url che verranno poi utilizzati nelle chiamate ajax API
	//url for api calls
	if (login == true) {
		var urlGetBranches = urlApi + "/projects/" + nameProject + "/repository/branches";
		console.log("urlGetBranches: "+urlGetBranches)
		//per_page	Number of items to list for page (default: 20, max: 100)
		//the request is filtered by "merged", in order to return only the merge requests in that state
		var urlGetMergeRequest = urlApi + "/projects/" + nameProject + "/merge_requests?state=merged&per_page=100";
		console.log("urlGetMergeRequest: "+urlGetMergeRequest)
	}
	else {
		var urlGetBranches = urlApi + "/projects/" + nameProject + "/repository/branches";
		console.log("urlGetBranches: "+urlGetBranches)
		//per_page		Number of items to list for page (default: 20, max: 100)
		var urlGetMergeRequest = urlApi + "/projects/" + nameProject + "/merge_requests?state=merged&per_page=100";
		console.log("urlGetMergeRequest: "+urlGetMergeRequest)
	}



	branches.push(gitgraph.branch("master")); //branche master in branches[0]
	branches.find(x => x.name == "master").commit({
		author: "dario.telese@micegroup.it",
		column: 0,          // index of row to show this branches 
		message : "init Master",
		onClick: function (commit) {
			alert("Title: init Master\n" +
				"Author : " + commit.author + "\n" +
				"Date: " + commit.date);
		}
	});

	console.log("GET BRANCHES....")
	$.ajax({ //request api for BRANCHES
		url: urlGetBranches,
		headers: headers,
		success: function (data) {
			data.forEach(element => {
				if (element.name == "master") {
					return null;
				}
				else {
					branches.push(branches[0].branch(element.name)); //create and insert branches in array
					branches.find(x => x.name == element.name).commit({  //first commit of branche
						message: "init " + element.name,
						sha: element.id,
						onClick: function (commit) {
							console.log("Oh, you clicked my commit?!", commit);
							alert("Title: init " + element.name + "\n" +
								"Message: " + element.commit.message + "\n" +
								"Author : " + element.commit.author_email + "\n" +
								"Date: " + element.commit.committed_date);
						}

					})
				}
			});

			console.log("GET MERGE REQUEST...")
			$.ajax({ //request api for MERGE REQUEST
				url: urlGetMergeRequest,
				headers: headers,
				success: function (data) {

					data = data.reverse(); //to create the graph in order from left to right (from the oldest to the new)
					data.forEach(element => {
						var source = branches.find(x => x.name == element.source_branch);
						var target = branches.find(x => x.name == element.target_branch);
						if (source != undefined && target != undefined) { //if branche exists, it's possible to do merge
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
					console.log("END!!")
				} //end success
			}) //end call ajax merge request
		}//end success call BRANCES				
	}); // chiamata ajax per gli BRANCHES
}//END function main