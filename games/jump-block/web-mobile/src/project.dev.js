require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Block":[function(require,module,exports){
"use strict";
cc._RFpush(module, '656bdDb+lFIFoaXN1OhBa/K', 'Block');
// Script/Block.js

cc.Class({
  "extends": cc.Component,

  properties: function properties() {
    return {
      DEFAULT_POSITION_X: {
        "default": -450
      },
      //这里都是默认值
      mSpeed: 0,
      // 主角跳跃高度
      mJumpHeight: 0,
      // 主角跳跃持续时间
      mJumpDuration: 0
    };
  },

  // use this for initialization
  onLoad: function onLoad() {
    var self = this;
    self.node.scaleX = -1;
    //私有变量
    self.jumpAction = self.createJumpAction();
    self.isJumping = false;
    self.mGame; //From Game

    cc.director.getCollisionManager().enabled = true;
    cc.director.getCollisionManager().enabledDebugDraw = false;
    this.touchingNumber = 0;

    //add keyboard input listener to call turnLeft and turnRight
    cc.eventManager.addListener({
      event: cc.EventListener.KEYBOARD,
      onKeyPressed: function onKeyPressed(keyCode, event) {
        switch (keyCode) {
          case cc.KEY.space:
            self.jump();
            break;
        }
      }
    }, self.node);
    //添加点击事件
    if (self.mGame != null) {
      self.mGame.node.on(cc.Node.EventType.TOUCH_START, this.onGameViewClick.bind(this));
    }
  },

  onGameViewClick: function onGameViewClick() {
    this.jump();
  },

  // called every frame, uncomment this function to activate update callback
  update: function update(dt) {
    // console.log(" update "+dt+  this.node.position+"  "+this.mSpeed);

    if (this.mGame && !this.mGame.isPause) {
      var oneMove = this.mSpeed * dt;
      // console.log("oneMove:"+oneMove+" "+this.mSpeed);
      this.node.x += oneMove;
    }
  },
  createJumpAction: function createJumpAction() {
    console.log("jump");
    var self = this;

    // 跳跃上升
    this.moveUpAction = cc.moveBy(this.mJumpDuration, cc.p(0, this.mJumpHeight)).easing(cc.easeCubicActionOut());
    this.rotate180Action = cc.rotateBy(this.mJumpDuration, 90);
    this.moveDownAction = cc.moveBy(this.mJumpDuration, cc.p(0, -this.mJumpHeight)).easing(cc.easeCubicActionIn());
    this.upAndRotate = cc.spawn(this.moveUpAction, this.rotate180Action);
    this.downAndRotate = cc.spawn(this.moveDownAction, this.rotate180Action);
    var onActionFinished = cc.callFunc(function (target, score) {
      self.isJumping = false;
    }, this, 100); //动作完成后会给玩家加100分
    return cc.sequence(this.upAndRotate, this.downAndRotate, onActionFinished);
  },
  jump: function jump() {
    var self = this;
    if (self.isJumping) {
      return;
    }
    self.isJumping = true;
    this.node.runAction(this.jumpAction);
  },
  resetSelf: function resetSelf() {
    //self.mGame = this.getComponent("Game");
    this.node.active = false;
    this.node.stopAllActions();
    this.node.x = this.DEFAULT_POSITION_X;
    if (!!this.mGame) {
      this.node.y = this.mGame.getGroundY(this.node);
      console.log("resetSelf y=" + this.node.y);
    } else {
      console.warn("resetSelf mGame is null");
    }
    this.node.setRotation(0);
    this.isJumping = false;
    this.node.active = true;
  },
  onCollisionEnter: function onCollisionEnter(other) {
    console.log("onCollisionEnter ");
    this.node.color = cc.Color.RED;
    this.touchingNumber++;

    this.resetSelf();
    this.mGame.lossLife();
  },

  onCollisionStay: function onCollisionStay(other) {
    // console.log('on collision stay');
  },

  onCollisionExit: function onCollisionExit() {
    this.touchingNumber--;
    if (this.touchingNumber === 0) {
      this.node.color = cc.Color.WHITE;
    }
  }
});

cc._RFpop();
},{}],"Db":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'a4e82GKkZhJTrasK1utNGpI', 'Db');
// Script/Db.js

/**
 * Created by fuqiang on 2016/10/16.
 */

var db = {
  put: function put(key, val) {
    console.log("put :" + key + "  " + val);
    cc.sys.localStorage.setItem(key, val);
  },
  get: function get(key) {
    console.log("get:" + key);
    return cc.sys.localStorage.getItem(key);
  }
};

module.exports = db;

cc._RFpop();
},{}],"GameOver":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'df3fbk75QRGsI5Kq1gNj341', 'GameOver');
// Script/GameOver.js

var Global = require('Global');
var Db = require('Db');
var K_DATA = "Key_of_data";

cc.Class({
  'extends': cc.Component,

  properties: {
    mTitle: {
      'default': null,
      type: cc.Label
    },
    mScore: {
      'default': null,
      type: cc.Label
    },
    mRestartBtn: {
      'default': null,
      type: cc.Node
    },
    mStageLabel: {
      'default': null,
      type: cc.Label
    }
  },

  // use this for initialization
  onLoad: function onLoad() {
    console.log("onLoad GameOver " + Global.gameOverArg.trytimes);
    //display
    this.mScore.string = "Score: " + Global.gameOverArg.score;
    var tryTimesString = "TryTimes: " + Global.gameOverArg.trytimes;
    this.mStageLabel.string = "Stage: " + Global.gameOverArg.stage || 0;
    //save to local
    this.saveToLocal(Global.gameOverArg.score, Global.gameOverArg.trytimes, Global.gameOverArg.stage);
    var lastData = this.readLocalData();
    tryTimesString += "\n\n LastTime:\n Score:" + lastData.score + " \nTryTimes: " + lastData.trytimes;

    //绑定事件
    this.mRestartBtn.on(cc.Node.EventType.TOUCH_END, this.onRestartClick.bind(this));
  },

  // called every frame, uncomment this function to activate update callback
  update: function update(dt) {},

  onRestartClick: function onRestartClick() {
    cc.director.loadScene('GameMain');
  },

  saveToLocal: function saveToLocal(score, trytimes, stage) {
    var data = {
      score: score,
      trytimes: trytimes,
      stage: stage
    };
    Db.put(K_DATA, JSON.stringify(data));
  },
  readLocalData: function readLocalData() {
    var localData = JSON.parse(Db.get(K_DATA));
    console.log("localData " + JSON.stringify(localData));
    localData = !localData ? { score: 0, trytimes: 0, stage: 1 } : localData;
    return localData;
  }
});

cc._RFpop();
},{"Db":"Db","Global":"Global"}],"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '2a6d9iKgFNDBI2zZ94PpVQW', 'Game');
// Script/Game.js

var Helpers = require('Helpers');
var Global = require('Global');
var StageCreator = require('StageCreator');

cc.Class({
  'extends': cc.Component,

  properties: {
    mBlock: {
      'default': null,
      type: cc.Node
    },
    mGround: {
      'default': null,
      type: cc.Node
    },
    mMonsterBlockPrefs: {
      'default': [],
      type: cc.Prefab
    },
    randomRange: {
      'default': null,
      x: 500,
      y: 200
    },
    mScoreLabel: {
      'default': null,
      type: cc.Label
    },
    mTryTimesLabel: {
      'default': null,
      type: cc.Label
    },
    mScore: 0,
    mTryTimes: {
      'default': 20,
      type: cc.Integer
    },
    mMiddleNode: {
      'default': null,
      type: cc.Node
    },
    mPauseBtn: {
      'default': null,
      type: cc.Node
    },

    mResumeBtn: {
      'default': null,
      type: cc.Node
    },
    mPauseView: {
      'default': null,
      type: cc.Node
    },
    END_POSITION: {
      'default': 500
    },
    mCurrentStage: {
      'default': 1,
      type: cc.Integer
    },
    mStageValueNode: {
      'default': null,
      type: cc.Label
    },
    mIsPaused: {
      'default': false
    }
  },

  // use this for initialization
  onLoad: function onLoad() {
    var self = this;
    //self.createRamdomMonster();
    self.mBlockComp = self.mBlock.getComponent("Block");
    self.mBlockComp.mGame = this;
    self.mPauseBtn.on(cc.Node.EventType.TOUCH_END, self.onPauseClick.bind(this));
    self.mResumeBtn.on(cc.Node.EventType.TOUCH_END, self.onResumeClick.bind(this));
  },

  start: function start() {
    var self = this;
    console.log("start-resetBlock");
    StageCreator.init(this.node, self.mGround, self.mMonsterBlockPrefs);
    StageCreator.create(this.mCurrentStage);
    self.resetBlock();
    self.mPauseView.active = false;
    this.mTryTimesLabel.string = this.mTryTimes;
  },
  // called every frame, uncomment this function to activate update callback
  update: function update(dt) {
    if (this.mBlock.x > this.END_POSITION) {
      this.mBlock.x = this.mBlockComp.DEFAULT_POSITION_X;
      this.addStage();
      this.addLife();
      StageCreator.clearStage();
      StageCreator.create(this.mCurrentStage);
    }
  },

  initMonsters: function initMonsters() {},

  getGroundY: function getGroundY(node) {
    var self = this;
    //StageCreator.init(this.node, self.mGround, self.mMonsterBlockPrefs);
    return StageCreator.getGroundY(node);
  },

  resetBlock: function resetBlock() {
    console.log("Game  resetBlock try:" + this.mTryTimes);
    var blockComp = this.mBlockComp;
    if (!!blockComp) {
      blockComp.mGame = this;
      blockComp.resetSelf();
    }
  },

  lossLife: function lossLife() {
    console.log("lossLife " + this.mTryTimes);
    this.mTryTimes--;
    if (this.mTryTimes <= 0) {
      //You Loss
      this.gameOver();
    } else {
      this.mTryTimesLabel.string = this.mTryTimes;
    }
  },

  addLife: function addLife() {
    this.mTryTimes++;
    this.mTryTimesLabel.string = this.mTryTimes;
  },

  addStage: function addStage() {
    this.mCurrentStage++;
    this.mStageValueNode.string = this.mCurrentStage;
  },
  gameOver: function gameOver() {
    var self = this;
    this.mBlock.stopAllActions(); //停止 player 节点的跳跃动作
    Global.gameOverArg.score = this.mScore;
    Global.gameOverArg.stage = this.mCurrentStage;
    Global.gameOverArg.trytimes = this.mTryTimes;
    cc.director.loadScene('GameOver');
  },
  onPauseClick: function onPauseClick() {
    this.mIsPaused = true;
    this.mBlock.active = false;
    this.mPauseView.active = true;
  },
  onResumeClick: function onResumeClick() {
    this.mIsPaused = false;
    this.mBlock.active = true;
    this.mPauseView.active = false;
  }

});

cc._RFpop();
},{"Global":"Global","Helpers":"Helpers","StageCreator":"StageCreator"}],"Global":[function(require,module,exports){
"use strict";
cc._RFpush(module, '9ad14omXlVNQ4JznzGhRRjw', 'Global');
// Script/Global.js

//全局变量,用来传递参数

module.exports = {
  //GameOver Scene Arguments
  gameOverArg: {
    score: 0,
    trytimes: 0
  }
};

cc._RFpop();
},{}],"Helpers":[function(require,module,exports){
"use strict";
cc._RFpush(module, '1fc9eY87nxHX4JuOsolDTtg', 'Helpers');
// Script/Helpers.js

var Helpers = {
    getRandomInt: function getRandomInt(max) {
        return parseInt(cc.random0To1() * max);
    }
};

module.exports = Helpers;

cc._RFpop();
},{}],"Monster":[function(require,module,exports){
"use strict";
cc._RFpush(module, '56a4crGbatEJpehW7hZOuMD', 'Monster');
// Script/Monster.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        this.touchingNumber = 0;
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {},
    onCollisionEnter: function onCollisionEnter(other) {
        console.log("onCollisionEnter ");
        this.node.color = cc.Color.RED;
        this.touchingNumber++;
    },

    onCollisionStay: function onCollisionStay(other) {
        // console.log('on collision stay');
    },

    onCollisionExit: function onCollisionExit() {
        this.touchingNumber--;
        if (this.touchingNumber === 0) {
            this.node.color = cc.Color.WHITE;
        }
    }
});

cc._RFpop();
},{}],"PersistNode":[function(require,module,exports){
"use strict";
cc._RFpush(module, '6c1edIeOk1Hb6IUu5R8phTJ', 'PersistNode');
// Script/PersistNode.js

cc.Class({
  "extends": cc.Component,

  properties: {
    // foo: {
    //    default: null,      // The default value will be used only when the component attaching
    //                           to a node for the first time
    //    url: cc.Texture2D,  // optional, default is typeof default
    //    serializable: true, // optional, default is true
    //    visible: true,      // optional, default is true
    //    displayName: 'Foo', // optional
    //    readonly: false,    // optional, default is false
    // },
    // ...
  },

  // use this for initialization
  onLoad: function onLoad() {},

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },

  setGameOverArg: function setGameOverArg(arg) {
    this.gameOverArg = arg;
  },
  getGameOverArg: function getGameOverArg() {
    var a = this.gameOverArg;
    this.gameOverArg = undefined;
    return a;
  }

});

cc._RFpop();
},{}],"StageCreator":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'f8301C7SrpP3qhMVQDxiiUN', 'StageCreator');
// Script/StageCreator.js

/**
 *
 * TODO:
 * 每个障碍物设置一个难度值,每个关卡有一个难度值,随机生成障碍物来组成一个关卡
 *
 * TODO: 游戏节奏变化
 * 随着关卡增加难度要加大
 *  比如: 1,速度增加,方块距离加大
 *        2, 方块距离减小
 *         3, 增加组合障碍物
 *
 * 关卡生成器
 * Created by fuqiang on 2016/10/17.
 */
var Helpers = require('Helpers');
var instance = undefined;
var mGameNode, mGroundNode, mMonsterPrefabs;
var mGroundY = 0;

var MONSTER_TAG = 0x1000;

var mMonsters = [];

/**
 * 创建关卡
 * @param stage
 */
function create(stage) {
  console.log("createStage " + stage);

  //default
  var x = 50;
  for (var i = 0; i < stage; i++) {
    x = 50 + cc.randomMinus1To1() * 450;
    mMonsters.push(createRandomMonster(x));
  }
};

function gLeft(random) {
  random = random || 0;
  return -170 + Helpers.getRandomInt(random);
}
function gMiddle(random) {
  random = random || 0;
  return 70 + Helpers.getRandomInt(random);
}
function gRight(random) {
  random = random || 0;
  return 300 + Helpers.getRandomInt(random);
}

/**
 * 创建测试Stage
 *
 * @param stage
 */
function createTestStage(stage) {
  var x = 50;
  var minX = -200;
  var minSplit = 170 + Helpers.getRandomInt(50);
  var posX = minX;

  var distenceLv1 = 220;
  var distenceLv2 = 200;
  var distenceLv3 = 190;
  var distenceLvMax = 170;

  switch (stage) {
    case 1:
      mMonsters.push(createMonster(mMonsterPrefabs[0], posX = gMiddle(-20)));
      break;
    case 2:
      mMonsters.push(createMonster(mMonsterPrefabs[1], posX = gMiddle(10)));
      break;
    case 3:
      mMonsters.push(createMonster(mMonsterPrefabs[2], posX = gMiddle(10)));
      break;
    case 4:
      mMonsters.push(createMonster(mMonsterPrefabs[0], posX = gLeft(20)));
      mMonsters.push(createMonster(mMonsterPrefabs[2], posX = gRight()));
      break;
    case 5:
      mMonsters.push(createMonster(mMonsterPrefabs[1], posX = gLeft(20)));
      mMonsters.push(createMonster(mMonsterPrefabs[2], posX = gRight()));
      break;
    case 6:
      mMonsters.push(createMonster(mMonsterPrefabs[0], posX = gLeft(20)));
      mMonsters.push(createMonster(mMonsterPrefabs[1], posX = gRight(40)));
      break;
    //test for distence
    case 7:
      mMonsters.push(createMonster(mMonsterPrefabs[0], posX = gLeft(50)));
      mMonsters.push(createMonster(mMonsterPrefabs[2], posX = gMiddle(30)));
      break;
    case 8:
      mMonsters.push(createMonster(mMonsterPrefabs[1], posX = gLeft(20)));
      mMonsters.push(createMonster(mMonsterPrefabs[0], posX = gMiddle(20)));
      break;
    case 9:
      mMonsters.push(createMonster(mMonsterPrefabs[2], posX = gMiddle(30)));
      mMonsters.push(createMonster(mMonsterPrefabs[1], posX = gRight(50)));
      break;
    case 10:
      mMonsters.push(createMonster(mMonsterPrefabs[0], gLeft(-20)));
      mMonsters.push(createMonster(mMonsterPrefabs[1], gMiddle(0)));
      mMonsters.push(createMonster(mMonsterPrefabs[2], gRight(20)));
      break;
    default:
      if (stage < 20) {
        mMonsters.push(createRandomMonster(gLeft(-10), 3));
        mMonsters.push(createRandomMonster(gMiddle(20)));
        mMonsters.push(createRandomMonster(gRight(80), 3));
      } else if (stage < 30) {
        mMonsters.push(createRandomMonster(gLeft(-10), 3));
        mMonsters.push(createRandomMonster(gMiddle(70)));
        mMonsters.push(createRandomMonster(gRight(50), 3));
      } else if (stage < 40) {
        mMonsters.push(createRandomMonster(gLeft(20), 3));
        mMonsters.push(createRandomMonster(gMiddle(10)));
        mMonsters.push(createRandomMonster(gRight(80), 3));
      } else {
        mMonsters.push(createRandomMonster(gLeft(40), 3));
        mMonsters.push(createRandomMonster(gMiddle(35)));
        mMonsters.push(createRandomMonster(gRight(10), 3));
      }
      break;
  }
}

/**
 * 创建随机敌人
 * @param x       位置
 * @param noIndex 除noIndex之外
 * @returns {*}
 */
function createRandomMonster(x, noIndex) {
  var index = Helpers.getRandomInt(mMonsterPrefabs.length);
  while (noIndex == index) {
    index = Helpers.getRandomInt(mMonsterPrefabs.length);
  }
  console.log("index :" + index);
  return createMonster(mMonsterPrefabs[index], x);
}

/**
 * 创建Monster
 * @param monsterPrefab
 */
function createMonster(prefab, x) {
  cc.log("createMonster " + x);
  var monster = cc.instantiate(prefab);
  mGameNode.addChild(monster);
  var y = getGroundY(monster);
  monster.setPosition(cc.p(x, y));
  monster.tag = MONSTER_TAG;
  console.log("monster:" + monster.x + "    " + monster.y);
  return monster;
}

function clearStage() {
  console.log("clearStage remove monster count:" + mMonsters.length);
  for (var i = 0; i < mMonsters.length; i++) {
    mGameNode.removeChild(mMonsters[i]);
  }
  mMonsters = [];
}

/**
 * 获取地面高度
 * @param monster
 * @returns {number}
 */
function getGroundY(monster) {
  console.log(monster + " " + mGroundNode + "  " + mGameNode);
  console.log(mGroundNode.height + '+  ' + monster.height + "/2- " + mGameNode.height + "/2");
  return mGroundNode.y + mGroundNode.height / 2 + monster.height / 2;
};

module.exports = {
  init: function init(aGameNode, aGroundNode, aMonsterPrefabs) {
    mGameNode = aGameNode;
    mGroundNode = aGroundNode;
    mMonsterPrefabs = aMonsterPrefabs;
  },
  //test
  create: createTestStage, //create
  //create: create,
  clearStage: clearStage,
  getGroundY: getGroundY
};

cc._RFpop();
},{"Helpers":"Helpers"}]},{},["Helpers","Game","Monster","Block","PersistNode","Global","Db","GameOver","StageCreator"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiU2NyaXB0L0Jsb2NrLmpzIiwiU2NyaXB0L0RiLmpzIiwiU2NyaXB0L0dhbWVPdmVyLmpzIiwiU2NyaXB0L0dhbWUuanMiLCJTY3JpcHQvR2xvYmFsLmpzIiwiU2NyaXB0L0hlbHBlcnMuanMiLCJTY3JpcHQvTW9uc3Rlci5qcyIsIlNjcmlwdC9QZXJzaXN0Tm9kZS5qcyIsIlNjcmlwdC9TdGFnZUNyZWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNjU2YmREYitsRklGb2FYTjFPaEJhL0snLCAnQmxvY2snKTtcbi8vIFNjcmlwdC9CbG9jay5qc1xuXG5jYy5DbGFzcyh7XG4gIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgcHJvcGVydGllczogZnVuY3Rpb24gcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgREVGQVVMVF9QT1NJVElPTl9YOiB7XG4gICAgICAgIFwiZGVmYXVsdFwiOiAtNDUwXG4gICAgICB9LFxuICAgICAgLy/ov5nph4zpg73mmK/pu5jorqTlgLxcbiAgICAgIG1TcGVlZDogMCxcbiAgICAgIC8vIOS4u+inkui3s+i3g+mrmOW6plxuICAgICAgbUp1bXBIZWlnaHQ6IDAsXG4gICAgICAvLyDkuLvop5Lot7Pot4PmjIHnu63ml7bpl7RcbiAgICAgIG1KdW1wRHVyYXRpb246IDBcbiAgICB9O1xuICB9LFxuXG4gIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5ub2RlLnNjYWxlWCA9IC0xO1xuICAgIC8v56eB5pyJ5Y+Y6YePXG4gICAgc2VsZi5qdW1wQWN0aW9uID0gc2VsZi5jcmVhdGVKdW1wQWN0aW9uKCk7XG4gICAgc2VsZi5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICBzZWxmLm1HYW1lOyAvL0Zyb20gR2FtZVxuXG4gICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWQgPSB0cnVlO1xuICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkRGVidWdEcmF3ID0gZmFsc2U7XG4gICAgdGhpcy50b3VjaGluZ051bWJlciA9IDA7XG5cbiAgICAvL2FkZCBrZXlib2FyZCBpbnB1dCBsaXN0ZW5lciB0byBjYWxsIHR1cm5MZWZ0IGFuZCB0dXJuUmlnaHRcbiAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoe1xuICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuS0VZQk9BUkQsXG4gICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uIG9uS2V5UHJlc3NlZChrZXlDb2RlLCBldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIGNjLktFWS5zcGFjZTpcbiAgICAgICAgICAgIHNlbGYuanVtcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBzZWxmLm5vZGUpO1xuICAgIC8v5re75Yqg54K55Ye75LqL5Lu2XG4gICAgaWYgKHNlbGYubUdhbWUgIT0gbnVsbCkge1xuICAgICAgc2VsZi5tR2FtZS5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCB0aGlzLm9uR2FtZVZpZXdDbGljay5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH0sXG5cbiAgb25HYW1lVmlld0NsaWNrOiBmdW5jdGlvbiBvbkdhbWVWaWV3Q2xpY2soKSB7XG4gICAgdGhpcy5qdW1wKCk7XG4gIH0sXG5cbiAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIiB1cGRhdGUgXCIrZHQrICB0aGlzLm5vZGUucG9zaXRpb24rXCIgIFwiK3RoaXMubVNwZWVkKTtcblxuICAgIGlmICh0aGlzLm1HYW1lICYmICF0aGlzLm1HYW1lLmlzUGF1c2UpIHtcbiAgICAgIHZhciBvbmVNb3ZlID0gdGhpcy5tU3BlZWQgKiBkdDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwib25lTW92ZTpcIitvbmVNb3ZlK1wiIFwiK3RoaXMubVNwZWVkKTtcbiAgICAgIHRoaXMubm9kZS54ICs9IG9uZU1vdmU7XG4gICAgfVxuICB9LFxuICBjcmVhdGVKdW1wQWN0aW9uOiBmdW5jdGlvbiBjcmVhdGVKdW1wQWN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwianVtcFwiKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyDot7Pot4PkuIrljYdcbiAgICB0aGlzLm1vdmVVcEFjdGlvbiA9IGNjLm1vdmVCeSh0aGlzLm1KdW1wRHVyYXRpb24sIGNjLnAoMCwgdGhpcy5tSnVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XG4gICAgdGhpcy5yb3RhdGUxODBBY3Rpb24gPSBjYy5yb3RhdGVCeSh0aGlzLm1KdW1wRHVyYXRpb24sIDkwKTtcbiAgICB0aGlzLm1vdmVEb3duQWN0aW9uID0gY2MubW92ZUJ5KHRoaXMubUp1bXBEdXJhdGlvbiwgY2MucCgwLCAtdGhpcy5tSnVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25JbigpKTtcbiAgICB0aGlzLnVwQW5kUm90YXRlID0gY2Muc3Bhd24odGhpcy5tb3ZlVXBBY3Rpb24sIHRoaXMucm90YXRlMTgwQWN0aW9uKTtcbiAgICB0aGlzLmRvd25BbmRSb3RhdGUgPSBjYy5zcGF3bih0aGlzLm1vdmVEb3duQWN0aW9uLCB0aGlzLnJvdGF0ZTE4MEFjdGlvbik7XG4gICAgdmFyIG9uQWN0aW9uRmluaXNoZWQgPSBjYy5jYWxsRnVuYyhmdW5jdGlvbiAodGFyZ2V0LCBzY29yZSkge1xuICAgICAgc2VsZi5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICB9LCB0aGlzLCAxMDApOyAvL+WKqOS9nOWujOaIkOWQjuS8mue7meeOqeWutuWKoDEwMOWIhlxuICAgIHJldHVybiBjYy5zZXF1ZW5jZSh0aGlzLnVwQW5kUm90YXRlLCB0aGlzLmRvd25BbmRSb3RhdGUsIG9uQWN0aW9uRmluaXNoZWQpO1xuICB9LFxuICBqdW1wOiBmdW5jdGlvbiBqdW1wKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5pc0p1bXBpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5pc0p1bXBpbmcgPSB0cnVlO1xuICAgIHRoaXMubm9kZS5ydW5BY3Rpb24odGhpcy5qdW1wQWN0aW9uKTtcbiAgfSxcbiAgcmVzZXRTZWxmOiBmdW5jdGlvbiByZXNldFNlbGYoKSB7XG4gICAgLy9zZWxmLm1HYW1lID0gdGhpcy5nZXRDb21wb25lbnQoXCJHYW1lXCIpO1xuICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICB0aGlzLm5vZGUueCA9IHRoaXMuREVGQVVMVF9QT1NJVElPTl9YO1xuICAgIGlmICghIXRoaXMubUdhbWUpIHtcbiAgICAgIHRoaXMubm9kZS55ID0gdGhpcy5tR2FtZS5nZXRHcm91bmRZKHRoaXMubm9kZSk7XG4gICAgICBjb25zb2xlLmxvZyhcInJlc2V0U2VsZiB5PVwiICsgdGhpcy5ub2RlLnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZXNldFNlbGYgbUdhbWUgaXMgbnVsbFwiKTtcbiAgICB9XG4gICAgdGhpcy5ub2RlLnNldFJvdGF0aW9uKDApO1xuICAgIHRoaXMuaXNKdW1waW5nID0gZmFsc2U7XG4gICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gIH0sXG4gIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRW50ZXIob3RoZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIm9uQ29sbGlzaW9uRW50ZXIgXCIpO1xuICAgIHRoaXMubm9kZS5jb2xvciA9IGNjLkNvbG9yLlJFRDtcbiAgICB0aGlzLnRvdWNoaW5nTnVtYmVyKys7XG5cbiAgICB0aGlzLnJlc2V0U2VsZigpO1xuICAgIHRoaXMubUdhbWUubG9zc0xpZmUoKTtcbiAgfSxcblxuICBvbkNvbGxpc2lvblN0YXk6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uU3RheShvdGhlcikge1xuICAgIC8vIGNvbnNvbGUubG9nKCdvbiBjb2xsaXNpb24gc3RheScpO1xuICB9LFxuXG4gIG9uQ29sbGlzaW9uRXhpdDogZnVuY3Rpb24gb25Db2xsaXNpb25FeGl0KCkge1xuICAgIHRoaXMudG91Y2hpbmdOdW1iZXItLTtcbiAgICBpZiAodGhpcy50b3VjaGluZ051bWJlciA9PT0gMCkge1xuICAgICAgdGhpcy5ub2RlLmNvbG9yID0gY2MuQ29sb3IuV0hJVEU7XG4gICAgfVxuICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2E0ZTgyR0trWmhKVHJhc0sxdXROR3BJJywgJ0RiJyk7XG4vLyBTY3JpcHQvRGIuanNcblxuLyoqXG4gKiBDcmVhdGVkIGJ5IGZ1cWlhbmcgb24gMjAxNi8xMC8xNi5cbiAqL1xuXG52YXIgZGIgPSB7XG4gIHB1dDogZnVuY3Rpb24gcHV0KGtleSwgdmFsKSB7XG4gICAgY29uc29sZS5sb2coXCJwdXQgOlwiICsga2V5ICsgXCIgIFwiICsgdmFsKTtcbiAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWwpO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhcImdldDpcIiArIGtleSk7XG4gICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRiO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnZGYzZmJrNzVRUkdzSTVLcTFnTmozNDEnLCAnR2FtZU92ZXInKTtcbi8vIFNjcmlwdC9HYW1lT3Zlci5qc1xuXG52YXIgR2xvYmFsID0gcmVxdWlyZSgnR2xvYmFsJyk7XG52YXIgRGIgPSByZXF1aXJlKCdEYicpO1xudmFyIEtfREFUQSA9IFwiS2V5X29mX2RhdGFcIjtcblxuY2MuQ2xhc3Moe1xuICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbVRpdGxlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbVNjb3JlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbVJlc3RhcnRCdG46IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICB9LFxuICAgIG1TdGFnZUxhYmVsOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH1cbiAgfSxcblxuICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgY29uc29sZS5sb2coXCJvbkxvYWQgR2FtZU92ZXIgXCIgKyBHbG9iYWwuZ2FtZU92ZXJBcmcudHJ5dGltZXMpO1xuICAgIC8vZGlzcGxheVxuICAgIHRoaXMubVNjb3JlLnN0cmluZyA9IFwiU2NvcmU6IFwiICsgR2xvYmFsLmdhbWVPdmVyQXJnLnNjb3JlO1xuICAgIHZhciB0cnlUaW1lc1N0cmluZyA9IFwiVHJ5VGltZXM6IFwiICsgR2xvYmFsLmdhbWVPdmVyQXJnLnRyeXRpbWVzO1xuICAgIHRoaXMubVN0YWdlTGFiZWwuc3RyaW5nID0gXCJTdGFnZTogXCIgKyBHbG9iYWwuZ2FtZU92ZXJBcmcuc3RhZ2UgfHwgMDtcbiAgICAvL3NhdmUgdG8gbG9jYWxcbiAgICB0aGlzLnNhdmVUb0xvY2FsKEdsb2JhbC5nYW1lT3ZlckFyZy5zY29yZSwgR2xvYmFsLmdhbWVPdmVyQXJnLnRyeXRpbWVzLCBHbG9iYWwuZ2FtZU92ZXJBcmcuc3RhZ2UpO1xuICAgIHZhciBsYXN0RGF0YSA9IHRoaXMucmVhZExvY2FsRGF0YSgpO1xuICAgIHRyeVRpbWVzU3RyaW5nICs9IFwiXFxuXFxuIExhc3RUaW1lOlxcbiBTY29yZTpcIiArIGxhc3REYXRhLnNjb3JlICsgXCIgXFxuVHJ5VGltZXM6IFwiICsgbGFzdERhdGEudHJ5dGltZXM7XG5cbiAgICAvL+e7keWumuS6i+S7tlxuICAgIHRoaXMubVJlc3RhcnRCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uUmVzdGFydENsaWNrLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7fSxcblxuICBvblJlc3RhcnRDbGljazogZnVuY3Rpb24gb25SZXN0YXJ0Q2xpY2soKSB7XG4gICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdHYW1lTWFpbicpO1xuICB9LFxuXG4gIHNhdmVUb0xvY2FsOiBmdW5jdGlvbiBzYXZlVG9Mb2NhbChzY29yZSwgdHJ5dGltZXMsIHN0YWdlKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBzY29yZTogc2NvcmUsXG4gICAgICB0cnl0aW1lczogdHJ5dGltZXMsXG4gICAgICBzdGFnZTogc3RhZ2VcbiAgICB9O1xuICAgIERiLnB1dChLX0RBVEEsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgfSxcbiAgcmVhZExvY2FsRGF0YTogZnVuY3Rpb24gcmVhZExvY2FsRGF0YSgpIHtcbiAgICB2YXIgbG9jYWxEYXRhID0gSlNPTi5wYXJzZShEYi5nZXQoS19EQVRBKSk7XG4gICAgY29uc29sZS5sb2coXCJsb2NhbERhdGEgXCIgKyBKU09OLnN0cmluZ2lmeShsb2NhbERhdGEpKTtcbiAgICBsb2NhbERhdGEgPSAhbG9jYWxEYXRhID8geyBzY29yZTogMCwgdHJ5dGltZXM6IDAsIHN0YWdlOiAxIH0gOiBsb2NhbERhdGE7XG4gICAgcmV0dXJuIGxvY2FsRGF0YTtcbiAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcyYTZkOWlLZ0ZOREJJMnpaOTRQcFZRVycsICdHYW1lJyk7XG4vLyBTY3JpcHQvR2FtZS5qc1xuXG52YXIgSGVscGVycyA9IHJlcXVpcmUoJ0hlbHBlcnMnKTtcbnZhciBHbG9iYWwgPSByZXF1aXJlKCdHbG9iYWwnKTtcbnZhciBTdGFnZUNyZWF0b3IgPSByZXF1aXJlKCdTdGFnZUNyZWF0b3InKTtcblxuY2MuQ2xhc3Moe1xuICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbUJsb2NrOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBtR3JvdW5kOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBtTW9uc3RlckJsb2NrUHJlZnM6IHtcbiAgICAgICdkZWZhdWx0JzogW10sXG4gICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICB9LFxuICAgIHJhbmRvbVJhbmdlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB4OiA1MDAsXG4gICAgICB5OiAyMDBcbiAgICB9LFxuICAgIG1TY29yZUxhYmVsOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbVRyeVRpbWVzTGFiZWw6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgfSxcbiAgICBtU2NvcmU6IDAsXG4gICAgbVRyeVRpbWVzOiB7XG4gICAgICAnZGVmYXVsdCc6IDIwLFxuICAgICAgdHlwZTogY2MuSW50ZWdlclxuICAgIH0sXG4gICAgbU1pZGRsZU5vZGU6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICB9LFxuICAgIG1QYXVzZUJ0bjoge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdHlwZTogY2MuTm9kZVxuICAgIH0sXG5cbiAgICBtUmVzdW1lQnRuOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBtUGF1c2VWaWV3OiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBFTkRfUE9TSVRJT046IHtcbiAgICAgICdkZWZhdWx0JzogNTAwXG4gICAgfSxcbiAgICBtQ3VycmVudFN0YWdlOiB7XG4gICAgICAnZGVmYXVsdCc6IDEsXG4gICAgICB0eXBlOiBjYy5JbnRlZ2VyXG4gICAgfSxcbiAgICBtU3RhZ2VWYWx1ZU5vZGU6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgfSxcbiAgICBtSXNQYXVzZWQ6IHtcbiAgICAgICdkZWZhdWx0JzogZmFsc2VcbiAgICB9XG4gIH0sXG5cbiAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvL3NlbGYuY3JlYXRlUmFtZG9tTW9uc3RlcigpO1xuICAgIHNlbGYubUJsb2NrQ29tcCA9IHNlbGYubUJsb2NrLmdldENvbXBvbmVudChcIkJsb2NrXCIpO1xuICAgIHNlbGYubUJsb2NrQ29tcC5tR2FtZSA9IHRoaXM7XG4gICAgc2VsZi5tUGF1c2VCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBzZWxmLm9uUGF1c2VDbGljay5iaW5kKHRoaXMpKTtcbiAgICBzZWxmLm1SZXN1bWVCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBzZWxmLm9uUmVzdW1lQ2xpY2suYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0LXJlc2V0QmxvY2tcIik7XG4gICAgU3RhZ2VDcmVhdG9yLmluaXQodGhpcy5ub2RlLCBzZWxmLm1Hcm91bmQsIHNlbGYubU1vbnN0ZXJCbG9ja1ByZWZzKTtcbiAgICBTdGFnZUNyZWF0b3IuY3JlYXRlKHRoaXMubUN1cnJlbnRTdGFnZSk7XG4gICAgc2VsZi5yZXNldEJsb2NrKCk7XG4gICAgc2VsZi5tUGF1c2VWaWV3LmFjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMubVRyeVRpbWVzTGFiZWwuc3RyaW5nID0gdGhpcy5tVHJ5VGltZXM7XG4gIH0sXG4gIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgaWYgKHRoaXMubUJsb2NrLnggPiB0aGlzLkVORF9QT1NJVElPTikge1xuICAgICAgdGhpcy5tQmxvY2sueCA9IHRoaXMubUJsb2NrQ29tcC5ERUZBVUxUX1BPU0lUSU9OX1g7XG4gICAgICB0aGlzLmFkZFN0YWdlKCk7XG4gICAgICB0aGlzLmFkZExpZmUoKTtcbiAgICAgIFN0YWdlQ3JlYXRvci5jbGVhclN0YWdlKCk7XG4gICAgICBTdGFnZUNyZWF0b3IuY3JlYXRlKHRoaXMubUN1cnJlbnRTdGFnZSk7XG4gICAgfVxuICB9LFxuXG4gIGluaXRNb25zdGVyczogZnVuY3Rpb24gaW5pdE1vbnN0ZXJzKCkge30sXG5cbiAgZ2V0R3JvdW5kWTogZnVuY3Rpb24gZ2V0R3JvdW5kWShub2RlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vU3RhZ2VDcmVhdG9yLmluaXQodGhpcy5ub2RlLCBzZWxmLm1Hcm91bmQsIHNlbGYubU1vbnN0ZXJCbG9ja1ByZWZzKTtcbiAgICByZXR1cm4gU3RhZ2VDcmVhdG9yLmdldEdyb3VuZFkobm9kZSk7XG4gIH0sXG5cbiAgcmVzZXRCbG9jazogZnVuY3Rpb24gcmVzZXRCbG9jaygpIHtcbiAgICBjb25zb2xlLmxvZyhcIkdhbWUgIHJlc2V0QmxvY2sgdHJ5OlwiICsgdGhpcy5tVHJ5VGltZXMpO1xuICAgIHZhciBibG9ja0NvbXAgPSB0aGlzLm1CbG9ja0NvbXA7XG4gICAgaWYgKCEhYmxvY2tDb21wKSB7XG4gICAgICBibG9ja0NvbXAubUdhbWUgPSB0aGlzO1xuICAgICAgYmxvY2tDb21wLnJlc2V0U2VsZigpO1xuICAgIH1cbiAgfSxcblxuICBsb3NzTGlmZTogZnVuY3Rpb24gbG9zc0xpZmUoKSB7XG4gICAgY29uc29sZS5sb2coXCJsb3NzTGlmZSBcIiArIHRoaXMubVRyeVRpbWVzKTtcbiAgICB0aGlzLm1UcnlUaW1lcy0tO1xuICAgIGlmICh0aGlzLm1UcnlUaW1lcyA8PSAwKSB7XG4gICAgICAvL1lvdSBMb3NzXG4gICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubVRyeVRpbWVzTGFiZWwuc3RyaW5nID0gdGhpcy5tVHJ5VGltZXM7XG4gICAgfVxuICB9LFxuXG4gIGFkZExpZmU6IGZ1bmN0aW9uIGFkZExpZmUoKSB7XG4gICAgdGhpcy5tVHJ5VGltZXMrKztcbiAgICB0aGlzLm1UcnlUaW1lc0xhYmVsLnN0cmluZyA9IHRoaXMubVRyeVRpbWVzO1xuICB9LFxuXG4gIGFkZFN0YWdlOiBmdW5jdGlvbiBhZGRTdGFnZSgpIHtcbiAgICB0aGlzLm1DdXJyZW50U3RhZ2UrKztcbiAgICB0aGlzLm1TdGFnZVZhbHVlTm9kZS5zdHJpbmcgPSB0aGlzLm1DdXJyZW50U3RhZ2U7XG4gIH0sXG4gIGdhbWVPdmVyOiBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5tQmxvY2suc3RvcEFsbEFjdGlvbnMoKTsgLy/lgZzmraIgcGxheWVyIOiKgueCueeahOi3s+i3g+WKqOS9nFxuICAgIEdsb2JhbC5nYW1lT3ZlckFyZy5zY29yZSA9IHRoaXMubVNjb3JlO1xuICAgIEdsb2JhbC5nYW1lT3ZlckFyZy5zdGFnZSA9IHRoaXMubUN1cnJlbnRTdGFnZTtcbiAgICBHbG9iYWwuZ2FtZU92ZXJBcmcudHJ5dGltZXMgPSB0aGlzLm1UcnlUaW1lcztcbiAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ0dhbWVPdmVyJyk7XG4gIH0sXG4gIG9uUGF1c2VDbGljazogZnVuY3Rpb24gb25QYXVzZUNsaWNrKCkge1xuICAgIHRoaXMubUlzUGF1c2VkID0gdHJ1ZTtcbiAgICB0aGlzLm1CbG9jay5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLm1QYXVzZVZpZXcuYWN0aXZlID0gdHJ1ZTtcbiAgfSxcbiAgb25SZXN1bWVDbGljazogZnVuY3Rpb24gb25SZXN1bWVDbGljaygpIHtcbiAgICB0aGlzLm1Jc1BhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMubUJsb2NrLmFjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5tUGF1c2VWaWV3LmFjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnOWFkMTRvbVhsVk5RNEp6bnpHaFJSancnLCAnR2xvYmFsJyk7XG4vLyBTY3JpcHQvR2xvYmFsLmpzXG5cbi8v5YWo5bGA5Y+Y6YePLOeUqOadpeS8oOmAkuWPguaVsFxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy9HYW1lT3ZlciBTY2VuZSBBcmd1bWVudHNcbiAgZ2FtZU92ZXJBcmc6IHtcbiAgICBzY29yZTogMCxcbiAgICB0cnl0aW1lczogMFxuICB9XG59O1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMWZjOWVZODdueEhYNEp1T3NvbERUdGcnLCAnSGVscGVycycpO1xuLy8gU2NyaXB0L0hlbHBlcnMuanNcblxudmFyIEhlbHBlcnMgPSB7XG4gICAgZ2V0UmFuZG9tSW50OiBmdW5jdGlvbiBnZXRSYW5kb21JbnQobWF4KSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludChjYy5yYW5kb20wVG8xKCkgKiBtYXgpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSGVscGVycztcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzU2YTRjckdiYXRFSnBlaFc3aFpPdU1EJywgJ01vbnN0ZXInKTtcbi8vIFNjcmlwdC9Nb25zdGVyLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICBjYy5kaXJlY3Rvci5nZXRDb2xsaXNpb25NYW5hZ2VyKCkuZW5hYmxlZERlYnVnRHJhdyA9IHRydWU7XG4gICAgICAgIHRoaXMudG91Y2hpbmdOdW1iZXIgPSAwO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7fSxcbiAgICBvbkNvbGxpc2lvbkVudGVyOiBmdW5jdGlvbiBvbkNvbGxpc2lvbkVudGVyKG90aGVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25Db2xsaXNpb25FbnRlciBcIik7XG4gICAgICAgIHRoaXMubm9kZS5jb2xvciA9IGNjLkNvbG9yLlJFRDtcbiAgICAgICAgdGhpcy50b3VjaGluZ051bWJlcisrO1xuICAgIH0sXG5cbiAgICBvbkNvbGxpc2lvblN0YXk6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uU3RheShvdGhlcikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnb24gY29sbGlzaW9uIHN0YXknKTtcbiAgICB9LFxuXG4gICAgb25Db2xsaXNpb25FeGl0OiBmdW5jdGlvbiBvbkNvbGxpc2lvbkV4aXQoKSB7XG4gICAgICAgIHRoaXMudG91Y2hpbmdOdW1iZXItLTtcbiAgICAgICAgaWYgKHRoaXMudG91Y2hpbmdOdW1iZXIgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc2YzFlZEllT2sxSGI2SVV1NVI4cGhUSicsICdQZXJzaXN0Tm9kZScpO1xuLy8gU2NyaXB0L1BlcnNpc3ROb2RlLmpzXG5cbmNjLkNsYXNzKHtcbiAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICBwcm9wZXJ0aWVzOiB7XG4gICAgLy8gZm9vOiB7XG4gICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgLy8gfSxcbiAgICAvLyAuLi5cbiAgfSxcblxuICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcblxuICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gIC8vIH0sXG5cbiAgc2V0R2FtZU92ZXJBcmc6IGZ1bmN0aW9uIHNldEdhbWVPdmVyQXJnKGFyZykge1xuICAgIHRoaXMuZ2FtZU92ZXJBcmcgPSBhcmc7XG4gIH0sXG4gIGdldEdhbWVPdmVyQXJnOiBmdW5jdGlvbiBnZXRHYW1lT3ZlckFyZygpIHtcbiAgICB2YXIgYSA9IHRoaXMuZ2FtZU92ZXJBcmc7XG4gICAgdGhpcy5nYW1lT3ZlckFyZyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gYTtcbiAgfVxuXG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2Y4MzAxQzdTcnBQM3FoTVZRRHhpaVVOJywgJ1N0YWdlQ3JlYXRvcicpO1xuLy8gU2NyaXB0L1N0YWdlQ3JlYXRvci5qc1xuXG4vKipcbiAqXG4gKiBUT0RPOlxuICog5q+P5Liq6Zqc56KN54mp6K6+572u5LiA5Liq6Zq+5bqm5YC8LOavj+S4quWFs+WNoeacieS4gOS4qumavuW6puWAvCzpmo/mnLrnlJ/miJDpmpznoo3nianmnaXnu4TmiJDkuIDkuKrlhbPljaFcbiAqXG4gKiBUT0RPOiDmuLjmiI/oioLlpY/lj5jljJZcbiAqIOmaj+edgOWFs+WNoeWinuWKoOmavuW6puimgeWKoOWkp1xuICogIOavlOWmgjogMSzpgJ/luqblop7liqAs5pa55Z2X6Led56a75Yqg5aSnXG4gKiAgICAgICAgMiwg5pa55Z2X6Led56a75YeP5bCPXG4gKiAgICAgICAgIDMsIOWinuWKoOe7hOWQiOmanOeijeeJqVxuICpcbiAqIOWFs+WNoeeUn+aIkOWZqFxuICogQ3JlYXRlZCBieSBmdXFpYW5nIG9uIDIwMTYvMTAvMTcuXG4gKi9cbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnSGVscGVycycpO1xudmFyIGluc3RhbmNlID0gdW5kZWZpbmVkO1xudmFyIG1HYW1lTm9kZSwgbUdyb3VuZE5vZGUsIG1Nb25zdGVyUHJlZmFicztcbnZhciBtR3JvdW5kWSA9IDA7XG5cbnZhciBNT05TVEVSX1RBRyA9IDB4MTAwMDtcblxudmFyIG1Nb25zdGVycyA9IFtdO1xuXG4vKipcbiAqIOWIm+W7uuWFs+WNoVxuICogQHBhcmFtIHN0YWdlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZShzdGFnZSkge1xuICBjb25zb2xlLmxvZyhcImNyZWF0ZVN0YWdlIFwiICsgc3RhZ2UpO1xuXG4gIC8vZGVmYXVsdFxuICB2YXIgeCA9IDUwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWdlOyBpKyspIHtcbiAgICB4ID0gNTAgKyBjYy5yYW5kb21NaW51czFUbzEoKSAqIDQ1MDtcbiAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKHgpKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ0xlZnQocmFuZG9tKSB7XG4gIHJhbmRvbSA9IHJhbmRvbSB8fCAwO1xuICByZXR1cm4gLTE3MCArIEhlbHBlcnMuZ2V0UmFuZG9tSW50KHJhbmRvbSk7XG59XG5mdW5jdGlvbiBnTWlkZGxlKHJhbmRvbSkge1xuICByYW5kb20gPSByYW5kb20gfHwgMDtcbiAgcmV0dXJuIDcwICsgSGVscGVycy5nZXRSYW5kb21JbnQocmFuZG9tKTtcbn1cbmZ1bmN0aW9uIGdSaWdodChyYW5kb20pIHtcbiAgcmFuZG9tID0gcmFuZG9tIHx8IDA7XG4gIHJldHVybiAzMDAgKyBIZWxwZXJzLmdldFJhbmRvbUludChyYW5kb20pO1xufVxuXG4vKipcbiAqIOWIm+W7uua1i+ivlVN0YWdlXG4gKlxuICogQHBhcmFtIHN0YWdlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRlc3RTdGFnZShzdGFnZSkge1xuICB2YXIgeCA9IDUwO1xuICB2YXIgbWluWCA9IC0yMDA7XG4gIHZhciBtaW5TcGxpdCA9IDE3MCArIEhlbHBlcnMuZ2V0UmFuZG9tSW50KDUwKTtcbiAgdmFyIHBvc1ggPSBtaW5YO1xuXG4gIHZhciBkaXN0ZW5jZUx2MSA9IDIyMDtcbiAgdmFyIGRpc3RlbmNlTHYyID0gMjAwO1xuICB2YXIgZGlzdGVuY2VMdjMgPSAxOTA7XG4gIHZhciBkaXN0ZW5jZUx2TWF4ID0gMTcwO1xuXG4gIHN3aXRjaCAoc3RhZ2UpIHtcbiAgICBjYXNlIDE6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgcG9zWCA9IGdNaWRkbGUoLTIwKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMV0sIHBvc1ggPSBnTWlkZGxlKDEwKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMl0sIHBvc1ggPSBnTWlkZGxlKDEwKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0OlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMF0sIHBvc1ggPSBnTGVmdCgyMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzJdLCBwb3NYID0gZ1JpZ2h0KCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNTpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzFdLCBwb3NYID0gZ0xlZnQoMjApKSk7XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1syXSwgcG9zWCA9IGdSaWdodCgpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDY6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgcG9zWCA9IGdMZWZ0KDIwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMV0sIHBvc1ggPSBnUmlnaHQoNDApKSk7XG4gICAgICBicmVhaztcbiAgICAvL3Rlc3QgZm9yIGRpc3RlbmNlXG4gICAgY2FzZSA3OlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMF0sIHBvc1ggPSBnTGVmdCg1MCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzJdLCBwb3NYID0gZ01pZGRsZSgzMCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgODpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzFdLCBwb3NYID0gZ0xlZnQoMjApKSk7XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgcG9zWCA9IGdNaWRkbGUoMjApKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDk6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1syXSwgcG9zWCA9IGdNaWRkbGUoMzApKSk7XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1sxXSwgcG9zWCA9IGdSaWdodCg1MCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMTA6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgZ0xlZnQoLTIwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMV0sIGdNaWRkbGUoMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzJdLCBnUmlnaHQoMjApKSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKHN0YWdlIDwgMjApIHtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTGVmdCgtMTApLCAzKSk7XG4gICAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZVJhbmRvbU1vbnN0ZXIoZ01pZGRsZSgyMCkpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnUmlnaHQoODApLCAzKSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YWdlIDwgMzApIHtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTGVmdCgtMTApLCAzKSk7XG4gICAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZVJhbmRvbU1vbnN0ZXIoZ01pZGRsZSg3MCkpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnUmlnaHQoNTApLCAzKSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YWdlIDwgNDApIHtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTGVmdCgyMCksIDMpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTWlkZGxlKDEwKSkpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdSaWdodCg4MCksIDMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZVJhbmRvbU1vbnN0ZXIoZ0xlZnQoNDApLCAzKSk7XG4gICAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZVJhbmRvbU1vbnN0ZXIoZ01pZGRsZSgzNSkpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnUmlnaHQoMTApLCAzKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKipcbiAqIOWIm+W7uumaj+acuuaVjOS6ulxuICogQHBhcmFtIHggICAgICAg5L2N572uXG4gKiBAcGFyYW0gbm9JbmRleCDpmaRub0luZGV45LmL5aSWXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUmFuZG9tTW9uc3Rlcih4LCBub0luZGV4KSB7XG4gIHZhciBpbmRleCA9IEhlbHBlcnMuZ2V0UmFuZG9tSW50KG1Nb25zdGVyUHJlZmFicy5sZW5ndGgpO1xuICB3aGlsZSAobm9JbmRleCA9PSBpbmRleCkge1xuICAgIGluZGV4ID0gSGVscGVycy5nZXRSYW5kb21JbnQobU1vbnN0ZXJQcmVmYWJzLmxlbmd0aCk7XG4gIH1cbiAgY29uc29sZS5sb2coXCJpbmRleCA6XCIgKyBpbmRleCk7XG4gIHJldHVybiBjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1tpbmRleF0sIHgpO1xufVxuXG4vKipcbiAqIOWIm+W7uk1vbnN0ZXJcbiAqIEBwYXJhbSBtb25zdGVyUHJlZmFiXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU1vbnN0ZXIocHJlZmFiLCB4KSB7XG4gIGNjLmxvZyhcImNyZWF0ZU1vbnN0ZXIgXCIgKyB4KTtcbiAgdmFyIG1vbnN0ZXIgPSBjYy5pbnN0YW50aWF0ZShwcmVmYWIpO1xuICBtR2FtZU5vZGUuYWRkQ2hpbGQobW9uc3Rlcik7XG4gIHZhciB5ID0gZ2V0R3JvdW5kWShtb25zdGVyKTtcbiAgbW9uc3Rlci5zZXRQb3NpdGlvbihjYy5wKHgsIHkpKTtcbiAgbW9uc3Rlci50YWcgPSBNT05TVEVSX1RBRztcbiAgY29uc29sZS5sb2coXCJtb25zdGVyOlwiICsgbW9uc3Rlci54ICsgXCIgICAgXCIgKyBtb25zdGVyLnkpO1xuICByZXR1cm4gbW9uc3Rlcjtcbn1cblxuZnVuY3Rpb24gY2xlYXJTdGFnZSgpIHtcbiAgY29uc29sZS5sb2coXCJjbGVhclN0YWdlIHJlbW92ZSBtb25zdGVyIGNvdW50OlwiICsgbU1vbnN0ZXJzLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbU1vbnN0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgbUdhbWVOb2RlLnJlbW92ZUNoaWxkKG1Nb25zdGVyc1tpXSk7XG4gIH1cbiAgbU1vbnN0ZXJzID0gW107XG59XG5cbi8qKlxuICog6I635Y+W5Zyw6Z2i6auY5bqmXG4gKiBAcGFyYW0gbW9uc3RlclxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0R3JvdW5kWShtb25zdGVyKSB7XG4gIGNvbnNvbGUubG9nKG1vbnN0ZXIgKyBcIiBcIiArIG1Hcm91bmROb2RlICsgXCIgIFwiICsgbUdhbWVOb2RlKTtcbiAgY29uc29sZS5sb2cobUdyb3VuZE5vZGUuaGVpZ2h0ICsgJysgICcgKyBtb25zdGVyLmhlaWdodCArIFwiLzItIFwiICsgbUdhbWVOb2RlLmhlaWdodCArIFwiLzJcIik7XG4gIHJldHVybiBtR3JvdW5kTm9kZS55ICsgbUdyb3VuZE5vZGUuaGVpZ2h0IC8gMiArIG1vbnN0ZXIuaGVpZ2h0IC8gMjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiBpbml0KGFHYW1lTm9kZSwgYUdyb3VuZE5vZGUsIGFNb25zdGVyUHJlZmFicykge1xuICAgIG1HYW1lTm9kZSA9IGFHYW1lTm9kZTtcbiAgICBtR3JvdW5kTm9kZSA9IGFHcm91bmROb2RlO1xuICAgIG1Nb25zdGVyUHJlZmFicyA9IGFNb25zdGVyUHJlZmFicztcbiAgfSxcbiAgLy90ZXN0XG4gIGNyZWF0ZTogY3JlYXRlVGVzdFN0YWdlLCAvL2NyZWF0ZVxuICAvL2NyZWF0ZTogY3JlYXRlLFxuICBjbGVhclN0YWdlOiBjbGVhclN0YWdlLFxuICBnZXRHcm91bmRZOiBnZXRHcm91bmRZXG59O1xuXG5jYy5fUkZwb3AoKTsiXX0=
