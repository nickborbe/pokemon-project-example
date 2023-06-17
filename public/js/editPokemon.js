document.addEventListener("DOMContentLoaded", () => {
  
    console.log("hello")

    document.getElementById("imgInput").style.visibility="hidden";


    document.getElementById("uploadNew").onclick = function(e){
        e.preventDefault();
        document.getElementById("imgInput").style.visibility="visible";
        e.currentTarget.style.visibility = "hidden";
    }

  });