// Import stylesheets
import './style.css';

let game = {};

const appDiv = document.getElementById('app');

let prevRender = 0;

let allResources = {
  mana: { display: 'Essence', value: 1, speed: 1000, cost: {}, output: { mana: 1 }, imageUrl: ''},
  fireEssence: { display: 'Fire Essence', value: 0, speed: 0, cost: {}, set: 'fire', imageUrl: ''},
  waterEssence: { display: 'Water Essence', value: 0, speed: 0, cost: {}, set: 'water', imageUrl: ''},
  earthEssence: { display: 'Earth Essence', value: 0, speed: 0, cost: {}, set: 'earth', imageUrl: ''},
  airEssence: { display: 'Air Essence', value: 0, speed: 0, cost: {}, set: 'air', imageUrl: ''},
  fireRune: { display: 'Fire Rune', value: 1, speed: 1000, cost: { mana: 1, fireEssence: 10 }, output: { fireEssence: 1 }, set: 'fire', imageUrl: ''},
  waterRune: { display: 'Water Rune', value: 1, speed: 1400, cost: { mana: 1, waterEssence: 10 }, output: { waterEssence: 1 }, set: 'water', imageUrl: ''},
  earthRune: { display: 'Earth Rune', value: 1, speed: 1800, cost: { mana: 1, earthEssence: 10 }, output: { earthEssence: 1 }, set: 'earth', imageUrl: ''},
  airRune: { display: 'Air Rune', value: 1, speed: 2200, cost: { mana: 1, airEssence: 10 }, output: { airEssence: 1 }, set: 'air', imageUrl: ''},
  imp: { display: 'Imp', value: 1, speed: 3000, cost: { mana: 1, fireEssence: 100, fireRune: 10 }, output: { fireRune: 1 }, set: 'fire', imageUrl: ''}
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
    label: document.getElementById('manaLabel'),
  };

  game.resources['fireEssence'] = allResources['fireEssence'];
  game.resources['fireEssence'].dom = { label: document.getElementById('fireLabel') };
  game.resources['fireEssence'].held = 0;

  game.resources['waterEssence'] = allResources['waterEssence'];
  game.resources['waterEssence'].dom = { label: document.getElementById('waterLabel') };
  game.resources['waterEssence'].held = 0;

  game.resources['earthEssence'] = allResources['earthEssence'];
  game.resources['earthEssence'].dom = { label: document.getElementById('earthLabel') };
  game.resources['earthEssence'].held = 0;

  game.resources['airEssence'] = allResources['airEssence'];
  game.resources['airEssence'].dom = { label: document.getElementById('airLabel') };
  game.resources['airEssence'].held = 0;

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
        for (const o in resource.output) {          
          let output = game.resources[o];
          if (property == 'mana') {
            output.held += resource.value * resource.output[o];
          } else {
            output.held += Math.max((resource.held * resource.value * resource.output[o]), 1);
          }          
        }
        resource.active = resource.auto;    
      }      
    }

    if (resource.dom.activateButton) resource.dom.activateButton.disabled = resource.active;
    if (resource.dom.label) resource.dom.label.innerHTML = resource.held;
    if (resource.dom.progressBar) resource.dom.progressBar.setAttribute('value', (resource.progress / resource.speed * 100))
    if (resource.dom.buyButton) resource.dom.buyButton.disabled = !canAfford(property, 1);    
  }

  if (game.resources['mana'].held >= 1) {
    if (!game.resources['fireRune']) addResource('fireRune');
    if (!game.resources['waterRune']) addResource('waterRune');
    if (!game.resources['earthRune']) addResource('earthRune');
    if (!game.resources['airRune']) addResource('airRune');
  }

  if (game.resources['fireRune'].held >= 10 && !game.resources['imp']) {
    addResource('imp');
    game.resources['fireRune'].auto = true;
  }
}

function addResource(resourceName) {
  game.resources[resourceName] = allResources[resourceName];

  game.resources[resourceName].active = false;
  game.resources[resourceName].held = 1;
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

  let img = document.createElement('img');
  img.setAttribute('src', `https://github.com/Amardos/summoner/blob/master/images/${resource.set}.png?raw=true`);
  img.setAttribute('style', 'height: 100%; width: 100%;');

  activateButton.appendChild(img);
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
  if (canAfford(resourceName, amount)) {
    let resource = game.resources[resourceName];

    for(const property in resource.cost) {
      game.resources[property].held -= resource.cost[property];
    }

    resource.held += amount;
  }
}

function canAfford(resourceName, amount) {
  let resource = game.resources[resourceName];

  let canAfford = true;

  for(const property in resource.cost) {
    if (game.resources[property].held < resource.cost[property] * amount) {
      canAfford = false;
      break;
    }
  }

  return canAfford;
}

// Run the game
init();