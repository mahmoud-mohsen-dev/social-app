const baseUrl = "https://tarmeezacademy.com/api/v1";
setupUI();
getPosts();

async function getPosts (){
    try {
        const response = await axios.get(baseUrl + "/posts?limit=10");
        const posts = response.data.data;
        const postsElement = document.querySelector(".posts")

        posts.forEach(post => {
            let {
              author: { profile_image, name },
              image,
              created_at,
              title,
              body,
              comments_count,
              tags,
            } = post;

            if (typeof profile_image === "object") {
              profile_image = "./images/1 - Copy.png";
            }

            if (typeof image === "object") {
              image = "./images/tree.jpg";
            }

            if (title === null) {
              title = "";
            }
            // console.log(tags)
            const tagsElements = tags
              .map(
                (tag) =>
                  `<span class='tag bg-secondary m-1 p-2 rounded text-white fw-medium'>${tag.name}</span>`
              )
              .join("");
            // console.log(tagsElements);
            postsElement.innerHTML += createPost(
              profile_image,
              name,
              image,
              created_at,
              title,
              body,
              comments_count,
              tagsElements
            );
        })
        // console.log(posts)
    } catch(err) {
        console.log(err)
    }
}


function createPost(
  avatarImgUrl,
  name,
  postImgUrl,
  time,
  title,
  body,
  comments_count,
  tagElement
) {
  const post = `
        <div class="card w-75 mx-auto mb-4">
            <div class="card-header">
                <img src="${avatarImgUrl}" class="rounded-circle border border-3 me-2" style="width: 50px;">
                <b>${name}</b>
            </div>
            <div class="card-body">
                <img src="${postImgUrl}" class="w-100 object-fit-cover" style="height: 400px;">

                <h5 class="text-primary fs-6 mt-2">${time}</h5>
                <h4>${title}</h4>
                <p>${body}</p>
                <hr>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                    </svg>
                    <span class="fw-medium">(${comments_count}) Comments</span>
                    <span class='tags'>${tagElement}</span>
                </div>
            </div>
        </div>
    `;
  return post;
}


async function loginBtnClick(){
    const username = document.querySelector("#input-username").value
    const password = document.querySelector("#input-password").value

    const data = {
      username: username,
      password: password,
    };

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    } 
    
    try {
        const response = await axios.post(baseUrl + "/login", data,  config)
        const responseData = response.data;

        localStorage.setItem("token", responseData.token);
        localStorage.setItem("user", JSON.stringify(responseData.user));  

        const modal = document.getElementById("login-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("Nice, you have loged in successfully", "success");
        setupUI()
    } catch (err){
        console.log(err)
    }
}


function showAlert(message, type){
    const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
    alertPlaceholder.innerHTML = "";
    const appendAlert = (message, type) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        "</div>",
      ].join("");

      alertPlaceholder.append(wrapper);
    };

    appendAlert(message, type);
}

function setupUI(){
    const loginBtn = document.querySelector("#login-btn");
    const registerBtn = document.querySelector("#register-btn");
    const signOutBtn = document.querySelector("#sign-out-btn")


    if (localStorage.getItem("token") === null){ // on sign out
        loginBtn.style.display = "block";
        registerBtn.style.display = "block";
        signOutBtn.style.display = "none";

    } else {
        loginBtn.style.display = 'none'
        registerBtn.style.display = 'none'
        signOutBtn.style.display = 'block'
    }
}


function onSignOut() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setupUI()   
    showAlert("See you Soon", "danger")
}


async function registerBtnClick() {
  const userName = document.querySelector("#register-username").value;
  const email = document.querySelector("#register-email").value;
  const password = document.querySelector("#register-password").value;
  const name = document.querySelector("#register-name").value;
  const fileInput = document.querySelector("#register-photo");
  const selectedFile = fileInput.files[0];
  console.log(selectedFile)

  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  const formdata = new FormData();
  formdata.append("username", userName);
  formdata.append("password", password);
  formdata.append("name", name);
  formdata.append("email", email);
  formdata.append("profile_image", selectedFile);

  console.log(formdata)

  try {
    const response = await axios.post(baseUrl + "/register", formdata, config);
    const responseData = response.data

    localStorage.setItem("token", responseData.token);
    localStorage.setItem("user", JSON.stringify(responseData.user));

    const modal = document.getElementById("register-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();

    showAlert("Nice, you have loged in and Signed Up successfully", "success");
    setupUI();
  } catch (err) {
    console.log(err);
  }
}
