"use strict"; // needed for the Android browser used with Cordova

let pages = [];
let links = [];

let standings = [];

// Our fetch module, re-used again!
// from: http://codepen.io/ProfessorTony/pen/XjvojK

document.addEventListener("DOMContentLoaded", function () {

    pages = document.querySelectorAll(".page");

    links = document.querySelectorAll(".nav a");

    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener("click", navigate);
    }

    serverData.getJSON();
});

let serverData = {
    // URL below is from the MAD9024 final assignment details in Canvas
    // you can choose the sport
    url: "https://griffis.edumedia.ca/mad9014/sports/quidditch.php",
    httpRequest: "GET",
    getJSON: function () {

        // Add headers and options objects
        // Create an empty Request Headers instance
        let headers = new Headers();

        // Add a header(s)
        // key value pairs sent to the server

        headers.append("Content-Type", "text/plain");
        headers.append("Accept", "application/json; charset=utf-8");

        // simply show them in the console
        console.dir("headers: " + headers.get("Content-Type"));
        console.dir("headers: " + headers.get("Accept"));

        // Now the best way to get this data all together is to use an options object:

        // Create an options object
        let options = {
            method: serverData.httpRequest,
            mode: "cors",
            headers: headers
        };

        // Create an request object so everything we need is in one package
        let request = new Request(serverData.url, options);
        console.log(request);

        fetch(request)
            .then(function (response) {

                console.log(response);
                return response.json();
            })
            .then(function (data) {
                console.log(data); // now we have JS data, let's display it

                // Call a function that uses the data we recieved  
                displayData(data);
            })
            .catch(function (err) {
                alert("Error: " + err.message);
            });
    }
};

function displayData(data) {
    console.log(data);

    // we need to save our sports data to localStorage:
    localStorage.setItem("scoredata", JSON.stringify(data));
    // we don't need to retrieve it for this assignment but we could use code like this to do so and to test if it was stored correctly:

    //   let savedScoreData = JSON.parse(localStorage.getItem("scoredata"));


    // lets display some data:

    console.log(data.teams);
    console.log(data.scores);
    
    
    standings = []; // empty the standings array

    // Create the standings array keys for each team
    data.teams.forEach(function (value) {
        let team = {
            id: value.id,
            points: 0,
            W: 0,
            L: 0,
            T: 0
        };
        standings.push(team);
    });
let tbody = document.querySelector("#teamStandings tbody");
    tbody.innerHTML = "";

    let ul = document.querySelector(".results_list"); // get our schedule unordered list
    ul.innerHTML = ""; // clear existing list items

    // create list items for each match in the schedule
    data.scores.forEach(function (value) {

        // create the HTML elements and initialize with the correct data
        let li = document.createElement("li");
        li.className = "score";

        let h3 = document.createElement("h3");
        h3.textContent = value.date;
        let h2 = document.createElement("h2");

        let homeTeam = null;
        let awayTeam = null;

        // for each game calculate the standings and create the HTML for the schedule with the correct data
        value.games.forEach(function (item) {

       
                        homeTeam = getTeamName(data.teams, item.home);
                        awayTeam = getTeamName(data.teams, item.away);
            
              if (item.home_score > item.away_score) {
                calculateStandings(item.home, "W");
                calculateStandings(item.away, "L");
            } else if (item.home_score < item.away_score) {
                calculateStandings(item.home, "L");
                calculateStandings(item.away, "W");
            } else {
                calculateStandings(item.home, "T");
                calculateStandings(item.away, "T");
            }

            h2.innerHTML += awayTeam + " " + item.away_score + "&nbsp" + homeTeam + " " + item.home_score + "<br>";

            // calculate stadings for this game...
        });

        // add our new schedule HTML to the unordered list
        ul.appendChild(li);
        ul.appendChild(h3);
        ul.appendChild(h2);

    });
    
     // sort the standings data based on total points highest first
    standings.sort(function (a, b) {
        return b.points - a.points;
    });


    // for each team create the HTML for the standings with the correct data
    standings.forEach(function (value) {

        //Tables stuff here:

        let tr = document.createElement("tr");
        let tdn = document.createElement("td");
        tdn.textContent = getTeamName(data.teams, value.id);
        let tdw = document.createElement("td");
        tdw.textContent = value.W;
        let tdl = document.createElement("td");
        tdl.textContent = value.L;
        let tdt = document.createElement("td");
        tdt.textContent = value.T;
        let tdp = document.createElement("td");
        tdp.textContent = value.points;
        tr.appendChild(tdn);
        tr.appendChild(tdw);
        tr.appendChild(tdl);
        tr.appendChild(tdt);
        tr.appendChild(tdp);
        tbody.appendChild(tr);

    });
}


//    Two page navigation
//    From http://codepen.io/ProfessorTony/pen/dOZrZW
function navigate(ev) {
    ev.preventDefault();

    // for this code to work correctly each anchor tag must have the same class name as 
    // the page ID it is navigating too.

    let a = ev.currentTarget; // get the anchor tag that was just clicked/tapped
    
    for (let i = 0; i < pages.length; i++) {
        if (pages[i].classList.contains("active")) { // find the currect active page
            if (pages[i].id == a.className) {
                // already on this page so just return
                console.log("this is already the active page!");
                return;
            } else {
                // we need to switch pages
                // In this code only have 2 pages so just toggle
                pages[0].classList.toggle("active");
                pages[1].classList.toggle("active");
                return;
            }
        }
    }
}


function getTeamName(teams, id) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id == id) {
            return teams[i].name;
        }
    }
    return "unknown";
}

function calculateStandings(id, result) {



    standings.forEach(function (value) {
        if (value.id == id) {

            switch (result) {

            case "W":
                value.points += 2;
                value.W++;
                break;

            case "L":
                value.L++;
                break;

            case "T":
                value.points += 1;
                value.T++;
                break;

            default:
                console.log("calculateStandings ERROR");
                break;

            }
        }
    });
}