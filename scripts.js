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

// initialize the UI
function initialLoad() {
  for (const type in CONFIG) {
    generateContainer(type, CONFIG[type].total, CONFIG[type].limit);
  }
  handleWalletUpdate(wallet);
  bindCheckButton();
  bindFinishButton();
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

    // check if the user has enough points to continue playing
    if (wallet < ROUND_COST) {
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
    const drawnMessage = `Regular numbers: ${drawnRegular.join(", ")}, Strong number: ${drawnStrong[0]}`;

    // update wallet and show result
    if (winCondition) {
      wallet += winCondition.prize;
      alert(`${drawnMessage}\nCongratulations! You won ${winCondition.prize} points!`);
    } else {
      alert(`${drawnMessage}\nSorry, no prize this time.`);
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
    // reset checkboxes
    disableGame();
    alert("Game has ended.\nYour final wallet balance is: " + wallet + " pts.");
  });
}

// reset lottery logic
function resetLotteryForm() {
  document.querySelectorAll("#regular-container input, #strong-container input").forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.disabled = false;
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
  });
}

// initialize the application
document.addEventListener("DOMContentLoaded", initialLoad);
