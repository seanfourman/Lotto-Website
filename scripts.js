// constants
const CONFIG = {
  regular: { total: 37, limit: 6 },
  strong: { total: 7, limit: 1 }
};
const ROUND_COST = 300;
const INITIAL_WALLET = 1000;
const winConditions = [
  { strong: CONFIG.strong.limit, regular: CONFIG.regular.limit, prize: 1000 },
  { strong: 0, regular: CONFIG.regular.limit, prize: 600 },
  { strong: CONFIG.strong.limit, regular: 4, prize: 400 }
];

// global variables (someone told me to never use var, we'll always use let or const)
let wallet = INITIAL_WALLET;
let isFirstTime = true;

// initialize the UI
function initialLoad() {
  for (const type in CONFIG) {
    generateContainer(type, CONFIG[type].total, CONFIG[type].limit);
  }
  handleWalletUpdate(wallet);
  bindCheckButton();
  bindFinishButton();
  updateRegularCounter();
}

// generate container for each checkbox type with a for loop -> create a checkbox with the createCheckbox function and add a limit handler to each checkbox
function generateContainer(type, total, limit) {
  const container = document.getElementById(`${type}-container`);
  if (container) {
    for (let i = 0; i < total; i++) {
      const checkbox = createCheckbox(i + 1);
      addCheckboxLimitHandler(container, checkbox, limit);
      container.appendChild(checkbox);
    }
  }
}

// create individual checkbox -> create a label element with the number value, a checkbox input and a span element for the checkmark
function createCheckbox(value) {
  const checkboxWrapper = document.createElement("label");
  checkboxWrapper.className = "container";
  checkboxWrapper.innerHTML = `
          <input type="checkbox">
          <span class="circle"></span>
          <h1>${value}</h1>
        `;
  return checkboxWrapper;
}

// add limit handling to checkboxes
function addCheckboxLimitHandler(container, checkboxWrapper, limit) {
  // get the checkbox input element
  const checkbox = checkboxWrapper.querySelector("input");

  // add event listener to the checkbox to count for when the limit is reached
  checkbox.addEventListener("change", () => {
    const selectedCheckboxes = container.querySelectorAll("input:checked");
    const allCheckboxes = container.querySelectorAll("input");

    // update the counter each time a checkbox is checked
    if (container.id === "regular-container") {
      updateRegularCounter();
    }

    if (selectedCheckboxes.length >= limit) {
      // disable all unchecked checkboxes when reaching the limit
      allCheckboxes.forEach((checkbox) => {
        if (!checkbox.checked) {
          checkbox.disabled = true;
        }
      });
    } else {
      // enable all checkboxes
      allCheckboxes.forEach((checkbox) => {
        checkbox.disabled = false;
      });
    }
  });
}

// update the wallet display
function handleWalletUpdate(value) {
  document.getElementById("wallet").textContent = `Points: ${value}`;
}

// check button logic
function bindCheckButton() {
  document.getElementById("check")?.addEventListener("click", () => {
    // create two arrays with the selected numbers (with map), convert each checkbox text to a number with a lambda expression
    const selectedRegular = Array.from(document.querySelectorAll("#regular-container input:checked")).map((checkbox) => parseInt(checkbox.parentElement.textContent.trim()));
    const selectedStrong = Array.from(document.querySelectorAll("#strong-container input:checked")).map((checkbox) => parseInt(checkbox.parentElement.textContent.trim()));

    // check if the user has enough points to continue playing, if isFirstTime is true, user hasn't ended the game yet
    if (wallet < ROUND_COST && isFirstTime) {
      alert("Insufficient points to continue playing.");
      return;
    }

    // check if the game is disabled -> if every checkbox is disabled, the game is disabled
    if (Array.from(document.querySelectorAll("#regular-container input, #strong-container input")).every((checkbox) => checkbox.disabled)) {
      alert("The game is currently disabled.");
      return;
    }

    // check if the user has selected the correct amount of numbers for each type
    if (selectedRegular.length !== CONFIG.regular.limit || selectedStrong.length !== CONFIG.strong.limit) {
      alert(`You need to select exactly ${CONFIG.regular.limit} regular and ${CONFIG.strong.limit} strong numbers.`);
      return;
    }

    // deduct round cost from wallet
    wallet -= ROUND_COST;

    // simulate a random draw
    const drawnRegular = randomNumbers(CONFIG.regular.total, CONFIG.regular.limit).sort((a, b) => a - b);
    const drawnStrong = randomNumbers(CONFIG.strong.total, CONFIG.strong.limit).sort((a, b) => a - b); // sort here is kinda pointless since it's only one number but you can change the strong number limit

    // check win conditions
    const matchingRegular = getMatchingNumbers(drawnRegular, selectedRegular);
    const matchingStrong = getMatchingNumbers(drawnStrong, selectedStrong);

    // check if the user has won (use find to check each value in dictionary against the results we got from matchingRegular, matchingStrong)
    const winCondition = winConditions.find((condition) => condition.regular === matchingRegular && condition.strong === matchingStrong);

    // display the results
    displayResults(selectedRegular, selectedStrong, drawnRegular, drawnStrong, winCondition);

    // update wallet and show result
    if (winCondition) {
      wallet += winCondition.prize;
    }

    handleWalletUpdate(wallet);
    resetLotteryForm();

    // check if the user has enough points to continue playing -> if not, disable the game
    if (wallet < ROUND_COST) {
      disableGame();
      return;
    }
  });
}

// finish button logic
function bindFinishButton() {
  document.getElementById("finish")?.addEventListener("click", () => {
    if (!isFirstTime && Array.from(document.querySelectorAll("#regular-container input, #strong-container input")).every((checkbox) => checkbox.disabled)) {
      alert("The game is already disabled.");
      return;
    }
    // reset checkboxes
    disableGame();
    alert("Game has ended.\nYour final wallet balance is: " + wallet + " pts.");
    isFirstTime = false; // for the first time, show the final wallet balance, after that, just show the alert that the game is already disabled
    // hide the result container when finishing the game
    const resultContainer = document.getElementById("result-container");
    if (resultContainer) {
      resultContainer.style.display = "none";
    }
  });
}

// reset lottery logic
function resetLotteryForm() {
  document.querySelectorAll("#regular-container input, #strong-container input").forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.disabled = false;
    updateRegularCounter(); // update the counter after resetting
  });
}

// utility function to generate random numbers
function randomNumbers(total, limit) {
  const numbers = [];

  // generate random numbers until the limit is reached and check if the number is already in the array
  while (numbers.length < limit) {
    const randomNumber = Math.floor(Math.random() * total) + 1;
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }

  return numbers;
}

// utility function to count matching numbers, filter the drawn numbers with a lambda expression and check for the length of the filtered array
function getMatchingNumbers(drawn, selected) {
  return drawn.filter((num) => selected.includes(num)).length;
}

// disable game for finish button
function disableGame() {
  document.querySelectorAll("#regular-container input, #strong-container input").forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.disabled = true;
    updateRegularCounter();
  });
}

// utility function to update the regular counter
function updateRegularCounter() {
  const selectedRegular = document.querySelectorAll("#regular-container input:checked").length;
  const limit = CONFIG.regular.limit;
  if (selectedRegular === limit) {
    document.getElementById("regular-counter").classList.add("completed");
  } else {
    document.getElementById("regular-counter").classList.remove("completed");
  }
  document.getElementById("regular-counter").textContent = `${selectedRegular} of ${limit}`;

  if (Array.from(document.querySelectorAll("#regular-container input, #strong-container input")).every((checkbox) => checkbox.disabled)) {
    document.getElementById("regular-counter").textContent = `DONE`;
    document.getElementById("regular-counter").classList.add("completed");
  }
}

// display the results of the raffle, show the drawn numbers and the selected numbers by the user
function displayResults(selectedRegular, selectedStrong, drawnRegular, drawnStrong, winCondition) {
  let resultContainer = document.getElementById("result-container");

  if (!resultContainer) {
    resultContainer = document.createElement("div");
    resultContainer.id = "result-container";
    document.querySelector(".lottery-form").appendChild(resultContainer);
  }

  // clear previous results if there are any
  resultContainer.innerHTML = "";

  // append user input and system draws
  appendResultSection(resultContainer, "Your Numbers", selectedRegular, drawnRegular);
  appendResultSection(resultContainer, null, selectedStrong, drawnStrong);
  appendResultSection(resultContainer, "Winning Numbers", drawnRegular, selectedRegular);
  appendResultSection(resultContainer, null, drawnStrong, selectedStrong);

  // feedback
  const feedback = document.createElement("p");
  feedback.textContent = winCondition ? `Congratulations! You won ${winCondition.prize} points!` : `Sorry, you didn't win this time. You lost ${ROUND_COST} points.`;
  feedback.classList.add("feedback", winCondition ? "feedback-success" : "feedback-failure");
  resultContainer.appendChild(feedback);
}

// utility function to append a result section
function appendResultSection(container, title, numbers, correctNumbers) {
  if (title) {
    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);
  }

  createNumberCircles(container, numbers, correctNumbers);
}

// create the circles for the numbers, check if the number is correct and apply the correct color
function createNumberCircles(container, numbers, correctNumbers = []) {
  const circleContainer = document.createElement("div");
  circleContainer.classList.add("result-numbers-container");

  numbers.forEach((number) => {
    const isCorrect = correctNumbers.includes(number); // check if the number is correct
    const circle = document.createElement("label");
    circle.className = "container";
    circle.innerHTML = `
          <input type="checkbox" disabled checked>
          <span class="circle" 
              style="background-color: ${isCorrect ? "#28a745" : "#dc3545"};"></span>
          <h1>${number}</h1>
      `;
    circleContainer.appendChild(circle);
  });

  container.appendChild(circleContainer);
}

// initialize the application
document.addEventListener("DOMContentLoaded", initialLoad);
