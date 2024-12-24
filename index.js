// Constants
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

let wallet = INITIAL_WALLET;

// Initialize the UI
function initialLoad() {
  for (const type in CONFIG) {
    generateContainer(type, CONFIG[type].total, CONFIG[type].limit);
  }
  handleWalletUpdate(wallet);
  bindGambleButton();
  bindResetButton();
}

// Generate container for checkboxes
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

// Create individual checkbox
function createCheckbox(value) {
  const checkboxWrapper = document.createElement("label");
  checkboxWrapper.className = "container";
  checkboxWrapper.innerHTML = `
          ${value}
          <input type="checkbox">
          <span class="checkmark"></span>
        `;
  return checkboxWrapper;
}

// Add limit handling to checkboxes
function addCheckboxLimitHandler(container, checkboxWrapper, limit) {
  const checkbox = checkboxWrapper.querySelector("input");

  checkbox.addEventListener("change", () => {
    const selectedCheckboxes = container.querySelectorAll("input:checked");
    const allCheckboxes = container.querySelectorAll("input");

    if (selectedCheckboxes.length >= limit) {
      // Disable all unchecked checkboxes
      allCheckboxes.forEach((checkbox) => {
        if (!checkbox.checked) {
          checkbox.disabled = true;
        }
      });
    } else {
      // Enable all checkboxes
      allCheckboxes.forEach((checkbox) => {
        checkbox.disabled = false;
      });
    }
  });
}

// Update the wallet display
function handleWalletUpdate(value) {
  document.getElementById("wallet").textContent = `Wallet: $${value}`;
}

// Gamble button logic
function bindGambleButton() {
  document.getElementById("gamble")?.addEventListener("click", () => {
    const selectedRegular = Array.from(document.querySelectorAll("#regular-container input:checked")).map((checkbox) => parseInt(checkbox.parentElement.textContent.trim()));
    const selectedStrong = Array.from(document.querySelectorAll("#strong-container input:checked")).map((checkbox) => parseInt(checkbox.parentElement.textContent.trim()));

    if (selectedRegular.length !== CONFIG.regular.limit || selectedStrong.length !== CONFIG.strong.limit) {
      alert(`You need to select exactly ${CONFIG.regular.limit} regular and ${CONFIG.strong.limit} strong numbers.`);
      return;
    }

    // Deduct round cost
    if (wallet < ROUND_COST) {
      alert("Insufficient funds to gamble!");
      return;
    }

    wallet -= ROUND_COST;

    // Simulate a random draw
    const drawnRegular = randomNumbers(CONFIG.regular.total, CONFIG.regular.limit);
    const drawnStrong = randomNumbers(CONFIG.strong.total, CONFIG.strong.limit);

    // Check win conditions
    const matchingRegular = getMatchingNumbers(drawnRegular, selectedRegular);
    const matchingStrong = getMatchingNumbers(drawnStrong, selectedStrong);

    const winCondition = winConditions.find((condition) => condition.regular === matchingRegular && condition.strong === matchingStrong);
    const drawnMessage = `Regular numbers: ${drawnRegular.join(", ")}, Strong number: ${drawnStrong[0]}`;

    if (winCondition) {
      wallet += winCondition.prize;
      alert(`${drawnMessage}\nCongratulations! You won $${winCondition.prize}!`);
    } else {
      alert(`${drawnMessage}\nSorry, no prize this time.`);
    }

    handleWalletUpdate(wallet);
    resetLotteryForm();
  });
}

// Reset button logic
function bindResetButton() {
  document.getElementById("reset")?.addEventListener("click", () => {
    // Reset checkboxes
    resetLotteryForm();

    // Reset wallet to the initial amount
    wallet = INITIAL_WALLET;
    handleWalletUpdate(wallet);

    alert("Game reset! Wallet restored.");
  });
}

function resetLotteryForm() {
  document.querySelectorAll("#regular-container input, #strong-container input").forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.disabled = false;
  });
}

// Utility function to generate random numbers
function randomNumbers(total, limit) {
  const numbers = [];

  while (numbers.length < limit) {
    const randomNumber = Math.floor(Math.random() * total) + 1;
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }

  return numbers;
}

// Utility function to count matching numbers
function getMatchingNumbers(drawn, selected) {
  return drawn.filter((num) => selected.includes(num)).length;
}

// Initialize the application
document.addEventListener("DOMContentLoaded", initialLoad);
