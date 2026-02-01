
document.addEventListener("DOMContentLoaded", () => {
  const likeBtn = document.getElementById("likeBtn");
  const likeDisplay = document.getElementById("likeCount");
  const addBtn = document.getElementById("addPhotoBtn");
  const urlInput = document.getElementById("photoUrl");
  const gallery = document.getElementById("photoGallery");
  const pagination = document.getElementById("pagination");
  const themeToggle = document.getElementById("themeToggle");
  const nameInput = document.getElementById("userNameInput");
  const chirpSound = document.getElementById("chirpSound");
  const headerTitle = document.getElementById("headerTitle");
  const headerChirp = document.getElementById("headerChirp");


  const PHOTOS_PER_PAGE = 10;
  let likeCount = 0;
  let currentPage = 1;

  
headerTitle.addEventListener("mouseenter", () => {
  headerChirp.currentTime = 0;
  headerChirp.play();
});

headerTitle.addEventListener("click", () => {
  headerChirp.currentTime = 0;
  headerChirp.play();
});

headerTitle.addEventListener("mouseleave", () => {
  headerChirp.pause();
  headerChirp.currentTime = 0; // Reset so it plays from the start next time
});

  // Like Button
  likeBtn.addEventListener("click", () => {
    likeCount++;
    likeDisplay.textContent = `❤️ ${likeCount}`;
    likeDisplay.classList.add("animate-heart");
    setTimeout(() => likeDisplay.classList.remove("animate-heart"), 500);
  });

  // Theme Toggle
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });

  // Add Photo
  addBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    const userName = nameInput.value.trim() || "Anonymous";
    const tags = getSelectedTags();
    const validExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
  // 🛎️ Show Notification
    const notify = document.getElementById("notification");
    notify.textContent = "📸 Your photo was added!";
    notify.style.display = "block";
    setTimeout(() => {
        notify.style.display = "none";
        }, 2000);

  // ❌ Validate URL
    if (!validExtensions.test(url)) {
      alert("Please enter a valid image URL ending in .jpg, .png, etc.");
      return;
    }

  // 💾 Save to localStorage
    const savedPhotos = JSON.parse(localStorage.getItem("parrotPhotos")) || [];
    savedPhotos.push({ url, comments: [], tags, userName });
    localStorage.setItem("parrotPhotos", JSON.stringify(savedPhotos));

  // 📦 update global photoData array (if used for rendering)
  photoData = savedPhotos;

  // 🔢 Recalculate current page based on new photo count
  const totalPhotos = photoData.length;
  currentPage = Math.ceil(totalPhotos / PHOTOS_PER_PAGE);

  // 🧹 Reset inputs
    urlInput.value = "";
    nameInput.value = "";

  // sound effect
    chirpSound?.play();

  // 🖼️ Re-render correct page with new photo
    renderGallery(currentPage);

  // 🎯 Scroll to the newly added card

  setTimeout(() => {
    const newCard = document.getElementById("newPhotoCard");
  if (newCard) {
    newCard.scrollIntoView({ behavior: "smooth", block: "center" });
    newCard.removeAttribute("id"); // clean up after scroll
  }
}, 300);

  });


  // Load photos via pagination
  renderGallery(currentPage);


  function renderGallery(page) {
    gallery.innerHTML = "";
    const photos = getPhotosForPage(page);
    photos.forEach(({ url, comments, tags, userName }) => {
      createPhotoCard(url, comments, tags, userName);
    });
    renderPagination(page);
  }

  function getPhotosForPage(page) {
    const savedPhotos = JSON.parse(localStorage.getItem("parrotPhotos")) || [];
    const start = (page - 1) * PHOTOS_PER_PAGE;
    return savedPhotos.slice(start, start + PHOTOS_PER_PAGE);
  }

  function renderPagination(currentPage) {
    const savedPhotos = JSON.parse(localStorage.getItem("parrotPhotos")) || [];
    const totalPages = Math.ceil(savedPhotos.length / PHOTOS_PER_PAGE);
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.classList.toggle("active", i === currentPage);
      btn.addEventListener("click", () => {
        currentPage = i;
        renderGallery(i);
      });
      pagination.appendChild(btn);
    }
  }

  function createPhotoCard(url, comments = [], tags = [], userName = "Anonymous") {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("id", "newPhotoCard");
    wrapper.className = "position-relative d-inline-block text-center mt-1";

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank"; // opens in new tab

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Parrot Photo";
    img.className = "img-thumbnail";
    img.style.width="220px";
    img.style.maxWidth = "250px";
    img.style.height="220px";
    img.style.maxHeight="250px";
        img.onerror = () => {
      img.src = "fallback-parrot.png";
      img.alt = "Unable to load parrot photo.";
    };
    link.appendChild(img);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.className = "remove-btn btn btn-sm btn-danger position-absolute top-0 end-0";
    deleteBtn.onclick = () => {
      removePhotoFromStorage(url);
      renderGallery(currentPage);
    };

    const nameTag = document.createElement("p");
    nameTag.textContent = `Shared by: ${userName}`;
    nameTag.className = "photo-author";

    const tagContainer = document.createElement("div");
    tagContainer.className = "d-flex justify-content-center flex-wrap mt-0.6";
    tags.forEach(tag => {
      const span = document.createElement("span");
      span.className = "photo-tag";
      span.textContent = tag;
      tagContainer.appendChild(span);
    });

    const commentInput = document.createElement("input");
    commentInput.type = "text";
    commentInput.placeholder = "Write a caption...";
    commentInput.className = "form-control mb12";
    commentInput.style.maxWidth = "200px";

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Send";
    sendBtn.className = "btn btn-sm btn-primary mb-1 mt-1 ";

    const commentStack = document.createElement("div");
    commentStack.className = "comment-stack";

    sendBtn.addEventListener("click", () => {
      const commentText = commentInput.value.trim();
      if (commentText) {
        const commentEl = document.createElement("div");
        commentEl.className = "comment-entry d-flex justify-content-between align-items-center";

        const text = document.createElement("p");
        text.textContent = `"${commentText}"`;
        text.className = "posted-comment";

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✖";
        removeBtn.className = "remove-comment-btn btn btn-sm btn-link text-danger";
        removeBtn.onclick = () => {
          commentEl.remove();
          removeStackedComment(url, commentText);
        };

        commentEl.appendChild(text);
        commentEl.appendChild(removeBtn);
        commentStack.appendChild(commentEl);

        commentInput.value = "";
        updatePhotoComment(url, commentText);
      }
    });

    let localLikeCount = 0;
    const photoLikeBtn = document.createElement("button");
    photoLikeBtn.textContent = "Like";
    photoLikeBtn.className = "btn btn-sm btn-primary";

    const photoLikeDisplay = document.createElement("div");
    photoLikeDisplay.textContent = "❤️ 0";
    photoLikeDisplay.className = "small-like-box";

    photoLikeBtn.addEventListener("click", () => {
      localLikeCount++;
      photoLikeDisplay.textContent = `❤️ ${localLikeCount}`;
      img.classList.add("sparkle");
      setTimeout(() => img.classList.remove("sparkle"), 800);
    });

    const likeRow = document.createElement("div");
    likeRow.className = "d-flex justify-content-center align-items-center gap-2 mt-2";
    likeRow.appendChild(photoLikeBtn);
    likeRow.appendChild(photoLikeDisplay);

    wrapper.appendChild(link);
    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(tagContainer);
    wrapper.appendChild(likeRow);
    wrapper.appendChild(nameTag);
    wrapper.appendChild(commentInput);
    wrapper.appendChild(sendBtn);
    wrapper.appendChild(commentStack);

    comments.forEach(text => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment-entry d-flex justify-content-between align-items-center";

      const p = document.createElement("p");
      p.textContent = `"${text}"`;
      p.className = "posted-comment";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✖";
      removeBtn.className = "remove-comment-btn btn btn-sm btn-link text-danger";
      removeBtn.onclick = () => {
        commentEl.remove();
        removeStackedComment(url, text);
      };

      commentEl.appendChild(p);
      commentEl.appendChild(removeBtn);
      commentStack.appendChild(commentEl);
    });

    gallery.appendChild(wrapper);
  }

  function updatePhotoComment(urlToUpdate, newComment) {
    const savedPhotos = JSON.parse(localStorage.getItem("parrotPhotos")) || [];
    const updatedPhotos = savedPhotos.map(photo =>
      photo.url === urlToUpdate
        ? { ...photo, comments: [...photo.comments, newComment] }
        : photo
    );
    localStorage.setItem("parrotPhotos", JSON.stringify(updatedPhotos));
  }

  function removeStackedComment(urlToUpdate, commentToRemove) {
    const savedPhotos = JSON.parse(localStorage.getItem("parrotPhotos")) || [];
    const updatedPhotos = savedPhotos.map(photo => {
      if (photo.url === urlToUpdate) {
        return { ...photo, comments: photo.comments.filter(c => c !== commentToRemove) };
      }
      return photo;
    });
    localStorage.setItem("parrotPhotos", JSON.stringify(updatedPhotos));
  }

  function removePhotoFromStorage(urlToRemove) {
    const savedPhotos = JSON.parse(localStorage.getItem("parrotPhotos")) || [];
    const updatedPhotos = savedPhotos.filter(photo => photo.url !== urlToRemove);
    localStorage.setItem("parrotPhotos", JSON.stringify(updatedPhotos));
  }
  
   function getSelectedTags() {
    const tagElements = document.querySelectorAll("input[name='personality']:checked, input[name='indoor-outdoor']:checked ");
    const tagList = [];
    tagElements.forEach(el => tagList.push(el.value));
    return tagList;
  }




});

