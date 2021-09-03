// This global gets changed by the selector buttons
textColour = [0xED,0xEB,0xEC];
outlineColour = [0xED,0xEB,0xEC];
breathingAnimationColour = [0x9D,0xB7,0xB8];
bgAudio = 'audio/1.mp3';

const breathInOutLenSec = 5;
const animFrameRate = 30;
const breathInOutFrameCnt = breathInOutLenSec * animFrameRate;
const breathHoldSec = 2;
const breatHoldFrameCnt = breathHoldSec * animFrameRate;

var chakraImage;
var chakraProportion = 0.8;
var running = false;
var afterP5jsSetup = null;

var diameter = 0.0;
var currentDiameter = 0.0;
var minDiameterProportion = 0.05;
var animPadding = 80;

const BREATH_IN = 'BI';
const BREATH_OUT = 'BO';
const HOLD_IN = 'HI';
const HOLD_OUT = 'HO';
var breathing = BREATH_IN;
var breathCount = 0;
var breathHold = 0;

var startedAt = 0;
var animLength = 60;
var animWidth = 0;
var animStep = 0;
var midnight = Math.PI*1.5;

var bgSound = {};
var bgSoundFadeInSecs = 3;

function preloadSound(soundFilename) {
	// preload the incoming sound file, if it is new
	console.log('"' + soundFilename + '", load started...');			
	bgSound[soundFilename] = loadSound(
		soundFilename,
		() => console.log('"' + soundFilename + '", load completed.'));
}

function preload() {
	sarinaFont = loadFont('fonts/Sarina-Regular.ttf');
	chakraImage = loadImage('img/logo-chakra.png');
}

function setup() {
	var parent = document.getElementById('breathe');
	var myCanvas = createCanvas(parent.offsetWidth, parent.offsetHeight);
	myCanvas.parent(parent.id);
	animWidth = parent.offsetWidth;
	currentDiameter = diameter = animWidth - animPadding;
	
	var diameterMaxChange = diameter - (diameter * minDiameterProportion);
	animStep = diameterMaxChange / breathInOutFrameCnt;
	
	frameRate(animFrameRate);
	setTimeout(() => preloadSound(bgAudio), 50);
}

function draw() {
	clear();
	noStroke();

	drawBreathingAnimation();
	
	if (running) {
		breathe();
	}
}

function drawBreathingAnimation() {
	drawGradient()
	drawChakra();
	drawText();
}

function drawGradient() {
	for (var r = 0; r < currentDiameter; ++r) {
		var alphaFactor = 1.0 - (r / diameter);
		fill(breathingAnimationColour[0], breathingAnimationColour[1], breathingAnimationColour[2], alphaFactor * 255.0);
		ellipse(width / 2, height / 2, r);
	}
}

function drawChakra() {
	tint(255, 63);
	var w = diameter * chakraProportion;
	var h = diameter * chakraProportion;
	image(chakraImage, (width-w)/2, (height-h)/2, w, h)
}

function drawText() {
	textFont(sarinaFont);
	textAlign(CENTER, CENTER);
	noStroke();
	fill(textColour[0], textColour[1], textColour[2]);
	if (!running) {
		textSize(32);
		text('Start', width / 2, height / 2)
	}
	else {
		textSize(24);
		switch (breathing) {
			case BREATH_IN:
				text('breathe in', width / 2, height / 2)
				break;
			case BREATH_OUT:
				text('breathe out', width / 2, height / 2)
				break;
			default:
				text('hold', width / 2, height / 2)
				break;
		}
	}
}

function breathe() {
	if (breathing != HOLD_OUT) {
		var secAngle = 360 / (animLength % 360);
		var archSize = (getCurrentSec() - startedAt) * secAngle;
		var sw = map(currentDiameter, 0, diameter * (1-minDiameterProportion), 1, 10, 50);
		strokeWeight(sw);
		stroke(outlineColour[0], outlineColour[1], outlineColour[2]);
		noFill();
		arc(width / 2, height / 2, currentDiameter-(sw+1), currentDiameter-(sw+1), midnight, midnight + archSize * (Math.PI/180));
	}

	switch (breathing) {
		case BREATH_IN:
			currentDiameter += animStep;
			if (currentDiameter >= diameter) {
				breathing = HOLD_IN;
				breathHold = 0;
			}
			break;
		case BREATH_OUT:
			currentDiameter -= animStep;
			if (currentDiameter <= (diameter * minDiameterProportion)) {
				breathing = HOLD_OUT;
				breathHold = 0;
			}
			break;
		case HOLD_IN:
			breathHold++;
			if (breathHold >= breatHoldFrameCnt) {
				breathing = BREATH_OUT;
			}
			break;
		case HOLD_OUT:
			breathHold++;
			if (breathHold >= breatHoldFrameCnt) {
				breathing = BREATH_IN;
				breathCount++;
			}
			break;
	}

	if (getCurrentSec() >= startedAt+animLength) {
		reset();
	}
}

function resetBgSounds() {
	var previouslyPlaying = [];
	for (var bgSoundKey in bgSound)
		if (bgSound[bgSoundKey].isPlaying()) {
			bgSound[bgSoundKey].setVolume(0.0, bgSoundFadeInSecs);
			bgSound[bgSoundKey].stop(bgSoundFadeInSecs);
			previouslyPlaying.push(bgSoundKey);
		}
	return previouslyPlaying;
}

function reset() {
	running = false;
	startedAt = 0;
	currentDiameter = diameter = animWidth - animPadding;
	breathing = BREATH_IN;
	breathCount = 0;
	breathHold = 0;
	resetBgSounds();
}

function mousePressed() {
	mousePressedIfOnBreathingAnimation();
}

function mousePressedIfOnBreathingAnimation() {
	var d = dist(mouseX, mouseY, width / 2, height / 2);
	var clickedOnStart = (d < diameter/2);
	if (clickedOnStart) {
		if (running) {
			reset();
		} else {
			running = true;

			// breathing animation: start
			currentDiameter = diameter * minDiameterProportion;
			startedAt = getCurrentSec();

			// ======================================================
			// audio: start
			// ======================================================
			// the audio may still be downloading if the user clicked
			// on start before the audio was downloaded. In that case
			// we keep rescheduling the start until it's ready or
			// until the animation finishes
			setTimeout(startPlayingWhenReady, 1000);
		}
	}
}

function startPlayingWhenReady() {
	if (running && bgAudio && bgSound[bgAudio]) {
		if (bgSound[bgAudio].isLoaded()) {
			bgSound[bgAudio].setVolume(0.0);
			bgSound[bgAudio].play();
			bgSound[bgAudio].setVolume(1.0, bgSoundFadeInSecs);
			bgSound[bgAudio].setLoop(true);
		}
		else
			setTimeout(startPlayingWhenReady, 1000);
	}
}

function getCurrentSec() {
	return new Date().getTime() / 1000;
}
