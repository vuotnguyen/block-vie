import settingIcon from "./svgs/setting.svg";

const backgroundImageHome = require('@/assets/images/background-home.png');
const hammerDark = require('@/assets/images/hammerDark.png');
const hammerLight = require('@/assets/images/hammerLight.png');
const setting = require('@/assets/images/setting.png');
const heart =  require('@/assets/images/heart.png');
 
const dragStart = require('@/assets/sounds/drag_start.mp3');
const dragEnd = require('@/assets/sounds/drag_end.mp3');
const addScore = require('@/assets/sounds/add_score.mp3');
const gameOver = require('@/assets/sounds/game_over.mp3');

export const icons = {
  settingIcon,
  backgroundImageHome,
  hammerDark,
  hammerLight,
  setting,
  heart,

};

export const images = {
  backgroundImageHome,
};
export const sounds = {
  startDrag: dragStart,
  endDrag: dragEnd,
  addScore: addScore,
  gameOver: gameOver,
};

