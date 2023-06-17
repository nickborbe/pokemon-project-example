document.addEventListener("DOMContentLoaded", () => {
    



    const theForm = document.getElementById("passwordForm");

    console.log(theForm);

    theForm.onsubmit = function(e){
        e.preventDefault();
        const pass1 = document.getElementById("pass1").value;
        const pass2 = document.getElementById("pass2").value;
        if(pass1 !== pass2){
            document.getElementById("alert").innerHTML = `<h3>Passwords Don't Match</h3>`
        } else {
            console.log("should Submit");
            theForm.submit();
        }
    }


  });
  