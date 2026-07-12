const buttons = document.querySelectorAll("button:not(:disabled)");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    alert("Resource booking request submitted successfully");
  });
});
