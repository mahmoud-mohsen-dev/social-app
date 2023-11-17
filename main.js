const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;

setupUI();

window.addEventListener("scroll", () => {
    const endPage =
      window.scrollY + window.innerHeight === document.documentElement.scrollHeight; 
    if (endPage && currentPage < lastPage) {
      currentPage += 1
      getPosts(currentPage)
    }
});

async function getPosts (page = 1){
    
    try {
        showLoader(true);
        const response = await axios.get(`${baseUrl}/posts?limit=5&page=${page}`);
        const posts = response.data.data;
        const postsElement = document.querySelector(".posts")
        lastPage = response.data.meta.last_page;

        posts.forEach(post => {
            const tagsElements = post.tags
              .map(
                (tag) =>
                  `<span class='tag bg-secondary m-1 p-2 rounded text-white fw-medium'>${tag.name}</span>`
              )
              .join("");
            postsElement.innerHTML += createPost(post, tagsElements);
            // console.log(post)
        })
    } catch(err) {
        console.log(err)
        showAlert(err.response.data.message, "danger");
        
    } finally {
      showLoader(false);
    }
}

function createPost(postObj, tagsElements) {
  let profileImage = "";
  let profilenName = "";
  const isAuthor = postObj.author !== undefined;

  if (isAuthor) {
    profileImage = postObj.author.profile_image;
    profilenName = postObj.author.name;
  } else {
    profileImage = postObj.profile_image;
    profilenName = postObj.name;
  }

  // console.log(postObj);
  // console.log(profilenName);
  if (typeof profileImage === "object") {
    profileImage = "./images/1 - Copy.png";
  }

  if (typeof postObj.image === "object") {
    postObj.image = "./images/tree.jpg";
  }

  if (postObj.title === null) {
    postObj.title = "";
  }

  const authorId = postObj.author.id;
  const userId = JSON.parse(localStorage.getItem("user"));
  let isUserIsTheAuthor = ''
  if (userId === null){
    isUserIsTheAuthor = false
  } else {
    isUserIsTheAuthor = authorId === userId.id;
  }

  let editVisibility = "visible;";
  let deleteVisibility = "visible;";
  if (!isUserIsTheAuthor) {
    editVisibility = "hidden;";
    deleteVisibility = "hidden;";
  }

  const post = `
        <div class="card w-75 mx-auto mb-4">
            <div class="card-header">
              <span onclick='goToProfilePage(${postObj.author.id})' style='cursor: pointer;'>
                <img src="${profileImage}" class="rounded-circle border border-3 me-2" style="width: 40px; height: 40px;">
                <b>${profilenName}</b>
              </span>
                <button class='btn btn-outline-danger delete-btn' style='float: right; visibility: ${deleteVisibility}' data-bs-toggle="modal" data-bs-target="#delete-modal" onclick='getPostObj(${JSON.stringify(
    postObj
  )})'>Delete</button>
                <button class='btn btn-outline-warning edit-btn me-2' style='float: right; visibility: ${editVisibility}' onclick='editPostBtnClick(${JSON.stringify(
    postObj
  )})'>Edit</button>
            </div>
            <div class="card-body" onclick="goToPostPage(${
              postObj.id
            })" style="cursor: pointer" >
                <img src="${
                  postObj.image
                }" class="w-100 " style="height: 400px;object-fit: cover;">

                <h5 class="text-primary fs-6 mt-2">${postObj.created_at}</h5>
                <h4>${postObj.title}</h4>
                <p>${postObj.body}</p>
                <hr>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                    </svg>
                    <span style='font-weight: 500'>(${
                      postObj.comments_count
                    }) Comments</span>
                    <span class='tags'>${tagsElements}</span>
                </div>
            </div>
        </div>
    `;

  return post;
}

async function registerBtnClick() {
  const userName = document.querySelector("#register-username").value;
  const email = document.querySelector("#register-email").value;
  const password = document.querySelector("#register-password").value;
  const name = document.querySelector("#register-name").value;
  const fileInput = document.querySelector("#register-photo").files[0];

  const config = {
    headers: {
      "content-type": "multipart/form-data",
    },
  };

  const formdata = new FormData();
  formdata.append("username", userName);
  formdata.append("password", password);
  formdata.append("name", name);
  formdata.append("email", email);
  formdata.append("image", fileInput);

  try {
    showLoader(true);
    const response = await axios.post(baseUrl + "/register", formdata, config);
    const responseData = response.data;
    // console.log(response);

    localStorage.setItem("token", responseData.token);
    localStorage.setItem("user", JSON.stringify(responseData.user));

    const modal = document.getElementById("register-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();

    showAlert("Nice, you have loged in and Signed Up successfully", "success");
    setupUI();
  } catch (err) {
    // console.log(err.response.data.message);
    showAlert(err.response.data.message, "danger");
  } finally {
    showLoader(false);
  }
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
        showLoader(true);
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
        showAlert(err.response.data.message, "danger");
    } finally {
      showLoader(false);
    }
}

function onSignOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
  showAlert("Loged Out successfully", "success");
  // location.reload();
}

function setupUI() {
  const loginBtn = document.querySelector("#login-btn");
  const registerBtn = document.querySelector("#register-btn");
  const signOutBtn = document.querySelector("#sign-out-btn");
  const postBtn = document.querySelector("#add-post");
  const userInfoContainer = document.querySelector("#user-info-container");
  const userImage = document.querySelector("#user-image");
  const userName = document.querySelector("#user-name");

  if (localStorage.getItem("token") === null) {
    // before clicking sign in
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    signOutBtn.style.display = "none";
    postBtn.style.display = "none";
    userInfoContainer.style.display = "none";
  } else {
    const userOnLocalStorage = JSON.parse(localStorage.getItem("user"));
    userImage.src = userOnLocalStorage.profile_image;
    userName.innerHTML = userOnLocalStorage.name;

    loginBtn.style.display = "none"; // before clicking sign out
    registerBtn.style.display = "none";
    signOutBtn.style.display = "block";
    postBtn.style.display = "block";
    userInfoContainer.style.display = "block";
  }
}

function showAlert(message, type){
    const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
    alertPlaceholder.innerHTML = "";
    alertPlaceholder.style.visibility = "visible";
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

    setTimeout(() => {
      alertPlaceholder.style.visibility = "hidden"
    }, 1500)

    
}

async function postBtnClick(){
    const title = document.querySelector("#post-title-input").value;
    const body = document.querySelector("#post-body-input").value;
    const image = document.querySelector("#post-image-input").files[0];
    const postHolder = document.querySelector("#post-id");

    try {

      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("image", image);

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      let url = ''
      let isCreated =
        postHolder.getAttribute("data-post-id") !== "" 

      if (isCreated) {
        url = `${baseUrl}/posts/${postHolder.getAttribute('data-post-id')}`;
        formData.append("_method", "put")
      } else {
        url = `${baseUrl}/posts`;
      }
      showLoader(true);
      await axios.post(url, formData, config);
      const modal = document.getElementById("post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      
      showAlert("Nice, Your Post is Published", "success");
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      // console.log(err);
      showAlert(err.response.data.message, "danger");
    } finally {
      showLoader(false);
    }
}

function getPost() {
  const search = document.location.search
  const params = new URLSearchParams(search)
  const postId = params.get('Post_Id')

  showLoader(true);
  const getPost = axios.get(
    `${baseUrl}/posts/${postId}`
  );
  getPost.then((response) => {

    const post = response.data.data;
    const postConatiner = document.getElementById("post-container");

    let {
      author: { profile_image, name, username, id: user_id },
      image,
      created_at,
      title,
      body,
      comments_count,
      tags,
      id,
      comments,
    } = post;
    console.log(post)

    if (typeof profile_image === "object") {
      profile_image = "./images/1 - Copy.png";
    }

    if (typeof image === "object") {
      image = "./images/tree.jpg";
    }

    if (title === null) {
      title = "";
    }

    const tagsElements = tags
      .map(
        (tag) =>
          `<span class='tag bg-secondary m-1 p-2 rounded text-white fw-medium'>${tag.name}</span>`
      )
      .join("");

    // console.log(comments)
    const commmentsElement = comments
      .map((comment) => {
        return `
         <div class='comment p-2 border rounded-3 mb-2' tyle='background-color: #cbd0d8;'>
            <span>
              <img src='${comment.author.profile_image}' class='border border-3' style='width: 40px; height: 40px; object-fit: cover; border-radius: 50%;'/>
              <span class='fw-medium ms-2'>${comment.author.username}</span>
            </span>
            <p class='fs-5' style='line-height: 1.2rem; margin-top: 10px ; margin-bottom: 5px; padding: 2px 5px;'>${comment.body}</p>
        </div>
      `;
      })
      .join("");

    postConatiner.innerHTML = `
      <div>
        <div class='w-25 mx-auto rounded-2 mb-3 p-2 fw-bold text-center' style='background: transparent;font-size: 1.8rem;color: white;'>${username}'s Post</div>
        <div class="card w-75 mx-auto mb-4">
            <div class="card-header" style='cursor: pointer;' onclick='goToProfilePage(${user_id})'>
                <img src="${profile_image}" class="rounded-circle border border-3 me-2" style="width: 40px;height: 40px">
                <b>${name}</b>
            </div>
            <div class="card-body">
                <img src="${image}" class="w-100 object-fit-cover" style="height: 400px;">

                <h5 class="text-primary fs-6 mt-2" style='color: chartreuse !important;'>${created_at}</h5>
                <h4>${title}</h4>
                <p>${body}</p>
                <hr>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                    </svg>
                    <span class="fw-medium">(${comments_count}) Comments</span>
                    <span class='tags'>${tagsElements}</span>
                </div>
                <hr />
                <div id='comments'>
                  ${commmentsElement}
                </div>
                <div  id='add-comment' class="input-group mt-3">
                  <input type="text" class="form-control" placeholder="add your comment..." id='add-comment-text'>
                  <button class="btn btn-warning" type="button" id="add-comment-btn" onclick='addComment(${id})'>Send</button>
                </div>
            </div>
        </div>

      </div>
    `;

    if (localStorage.getItem("token") === null) {
      const commentDiv = document.getElementById("add-comment");
      commentDiv.style.display = "none";
    }
  }).catch((err) => {
    console.log(err.response.data.message);
    showAlert(err.response.data.message, "danger");
  }).finally(() => {
    showLoader(false);
  })
}

function goToPostPage(idNumber){
  window.location.href = `./post.html?Post_Id=${idNumber}`
}

function goToProfilePage(userId) {
  window.location.href = `./profile.html?userId=${userId}`;
}

function addComment(postId) {
  if (localStorage.getItem("token") === null) {
    showAlert("You have to sign in", "danger");
    return;
  }
  const commentText = document.getElementById("add-comment-text").value;

  const body = {
    body: commentText,
  };

  showLoader(true);
  axios
    .post(`${baseUrl}/posts/${postId}/comments`, body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then((response) => {
      // console.log(response);
      showAlert("Your Comment Successfully Added", "success");
      setTimeout(() => location.reload(), 1500)
    })
    .catch((err) =>{ 
      console.log(err)
      showAlert(err.response.data.message, "danger");
    }).finally(() => {
      showLoader(false);
    })
}


function editPostBtnClick(postObj){
  const postModal = new bootstrap.Modal(document.getElementById("post-modal"));
  postModal.toggle()

  const postModalTitle = document.getElementById("post-modal-title");
  const postBtn = document.getElementById("post-btn");
  postModalTitle.innerHTML = 'Edit Post'
  postBtn.innerHTML = 'Update'

  const title = document.querySelector("#post-title-input");
  const body = document.querySelector("#post-body-input");
  title.value = postObj.title
  body.value = postObj.body

  const post = document.querySelector("#post-id");
  post.setAttribute("data-post-id", postObj.id)
  // console.log(postObj)
}


function addBtnClicked(){
  const postModal = new bootstrap.Modal(document.getElementById("post-modal"));
  postModal.toggle()

  const postModalTitle = document.getElementById("post-modal-title");
  const postBtn = document.getElementById("post-btn");
  postModalTitle.innerHTML = 'Create A New Post'
  postBtn.innerHTML = 'Create'

  const title = document.querySelector("#post-title-input");
  const body = document.querySelector("#post-body-input");
  title.value = ''
  body.value = ''

  const post = document.querySelector("#post-id");
  post.setAttribute("data-post-id", "");
}


function getPostObj(post){
  document.getElementById("delete-modal-hidden-input").value = post.id;
}

async function deleteBtnClick(){
  const postId = document.getElementById("delete-modal-hidden-input").value;
  console.log(postId)
  try {
    showLoader(true);
    const response = await axios.delete(
      `${baseUrl}/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    
    // console.log(response)
    const modal = document.getElementById("delete-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal)
    modalInstance.hide()

    showAlert('Deleted Successfully', 'success')
    setTimeout(() => location.reload(), 1500)

  } catch(err) {
    console.log(err.response.data.message)
    showAlert(err.response.data.message, 'danger')
  } finally {
    showLoader(false);
  }
}

async function getUserPosts(userId) {
  if (userId === null || userId === '' || userId === undefined){
    userId = JSON.parse(localStorage.getItem('user')).id
  }
  // console.log(userId)

  function promiseFunctions(){
    return Promise.resolve(userInfo(userId));
  }

  promiseFunctions().then(() => userBody(userId)).catch(err => console.log(err))
  
}


async function userInfo(userId) {
  try {
    showLoader(true);

    const response = await axios.get(`${baseUrl}/users/${userId}`);
    // console.log(response)
    const user = response.data.data;

    const profileImage = document.getElementById("header-image");

    if (typeof user.profile_image === "object") {
      profileImage.src = "./images/1 - copy.png";
    } else {
      profileImage.src = user.profile_image;
    }
    // console.log(profileImage.src)
    const profileEmail = document.getElementById("user-info-email");
    profileEmail.innerHTML = user.email;

    const profileUserName = document.getElementById("user-info-username");
    profileUserName.innerHTML = user.username;

    const profileName = document.getElementById("user-info-name");
    profileName.innerHTML = user.name;

    const postsCount = document.getElementById("user-info-count-posts");
    postsCount.innerHTML = user.posts_count;

    const commentsCount = document.getElementById("user-info-count-comments");
    commentsCount.innerHTML = user.comments_count;

    const userHeader = document.getElementById("user-info-title");
    userHeader.innerHTML = user.name + "'s posts";

    // getUserPosts(userId);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, "danger");
  } finally{
    showLoader(false);
  }
}

async function userBody(userId) {
  try {
    showLoader(true);
    const response = await axios.get(`${baseUrl}/users/${userId}/posts`);
    const posts = response.data.data;
    const postsElement = document.querySelector("#profile-posts");

    posts.forEach((post) => {
      const tagsElements = post.tags
        .map(
          (tag) =>
            `<span class='tag bg-secondary m-1 p-2 rounded text-white fw-medium'>${tag.name}</span>`
        )
        .join("");
      // console.log(post);
      postsElement.innerHTML += createPost(post, tagsElements);
    });
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, "danger");
  } finally {
    showLoader(false);
  }
}

function showLoader(show = true){
  if (show){
    document.getElementById('loader').style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}


