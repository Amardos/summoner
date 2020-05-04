// Import stylesheets
import './style.css';

let game = {};

const appDiv = document.getElementById('app');

let prevRender = 0;

let allResources = {
  mana: { display: 'Essence', value: 1, speed: 1000, cost: {}, imageUrl: ''},
  fireEssence: { display: 'Fire Essence', value: 0, speed: 0, cost: {}, set: 'fire', imageUrl: ''},
  waterEssence: { display: 'Water Essence', value: 0, speed: 0, cost: {}, set: 'water', imageUrl: ''},
  earthEssence: { display: 'Earth Essence', value: 0, speed: 0, cost: {}, set: 'earth', imageUrl: ''},
  airEssence: { display: 'Air Essence', value: 0, speed: 0, cost: {}, set: 'air', imageUrl: ''},
  fireRune: { display: 'Fire Rune', value: 1, speed: 1000, cost: { mana: 1 }, set: 'fire', imageUrl: ''}
};

function init() {
  game.resources = {};

  game.resources['mana'] = allResources['mana'];
  game.resources['mana'].active = true;
  game.resources['mana'].held = 0;
  game.resources['mana'].auto = true;
  game.resources['mana'].progress = 0;
  game.resources['mana'].dom = {
    progressBar: document.getElementById('progress-mana'),
    label: document.getElementById('show-mana'),
  };

  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  let delta = timestamp - prevRender;
  prevRender = timestamp;

  // Update
  update(delta);
  
  window.requestAnimationFrame(gameLoop);
}

function update(delta) {
  for(const property in game.resources) {
    let resource = game.resources[property];
    if (resource.active) {
      resource.progress += delta;
      if (resource.progress >= resource.speed) {
        resource.progress = 0;
        resource.held += resource.value;
        resource.active = resource.auto;    
      }

      if (resource.dom.activateButton) resource.dom.activateButton.disabled = resource.active;
      if (resource.dom.label) resource.dom.label.innerHTML = resource.held;
      if (resource.dom.progressBar) resource.dom.progressBar.setAttribute('value', (resource.progress / resource.speed * 100))
    }    
  }

  if (game.resources['mana'].held >= 1 && !game.resources['fireRune']) {
    addResource('fireRune');
  }
}

function addResource(resourceName) {
  game.resources[resourceName] = allResources[resourceName];

  game.resources[resourceName].active = false;
  game.resources[resourceName].held = 0;
  game.resources[resourceName].auto = false;
  game.resources[resourceName].progress = 0;

  addSection(appDiv, resourceName);
}

function addSection(parent, resourceName) {
  let resource = game.resources[resourceName];
  resource.dom = {};

  let container = document.createElement('div');
  container.setAttribute('class', 'grid-container resource-block');

  parent.appendChild(container);

  let activateButton = document.createElement('button');
  activateButton.setAttribute('class', `activate-resource ${resource.set}`);
  activateButton.addEventListener('click', function(){ activateResource(resourceName); });
  container.appendChild(activateButton);

  resource.dom.activateButton = activateButton;

  let progressBar = document.createElement('progress');
  progressBar.setAttribute('class', resource.set);
  progressBar.setAttribute('max', 100);
  progressBar.setAttribute('value', 0);
  container.appendChild(progressBar);

  resource.dom.progressBar = progressBar;

  let buyButton = document.createElement('button');
  buyButton.setAttribute('class', 'buy-resource');
  buyButton.addEventListener('click', function() { buyResource(resourceName, 1); });
  buyButton.innerHTML = `Buy 1x ${resource.display}`;
  container.appendChild(buyButton);

  resource.dom.buyButton = buyButton;

  let label = document.createElement('span');
  container.appendChild(label);

  resource.dom.label = label;
}

function activateResource(resourceName) {
  let resource = game.resources[resourceName];

  resource.active = true;
  resource.dom.activateButton.disabled = true;
}

function buyResource(resourceName, amount) {
  let resource = game.resources[resourceName];

  for(const property in resource.cost) {
    game.resources[property].held -= resource.cost[property];
  }

  resource.held += amount;
}

// Run the game
init();