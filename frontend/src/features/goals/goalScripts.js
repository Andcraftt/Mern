const openGoal = document.getElementById("openGoal")
const closeGoal = document.getElementById("closeGoal")
const goalInner = document.getElementById("goalInner")

openGoal.addEventListener("click", () => {
    goalInner.classList.add("open");
})

closeGoal.addEventListener("click", () => {
    goalInner.classList.add("open");
})