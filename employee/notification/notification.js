const notifications = document.querySelectorAll(".notification-card");

notifications.forEach((notification) => {
  notification.addEventListener("click", () => {
    notification.classList.remove("unread");
  });
});
