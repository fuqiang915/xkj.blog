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
    }
  },

  // use this for initialization
  onLoad: function onLoad() {
    var self = this;
    //self.createRamdomMonster();
    self.mBlockComp = self.mBlock.getComponent("Block");
    self.mBlockComp.mGame = this;
  },

  start: function start() {
    var self = this;
    console.log("start-resetBlock");
    StageCreator.init(this.node, self.mGround, self.mMonsterBlockPrefs);
    StageCreator.create(this.mCurrentStage);
    self.resetBlock();
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

  //test
  stage = 40;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiU2NyaXB0L0Jsb2NrLmpzIiwiU2NyaXB0L0RiLmpzIiwiU2NyaXB0L0dhbWVPdmVyLmpzIiwiU2NyaXB0L0dhbWUuanMiLCJTY3JpcHQvR2xvYmFsLmpzIiwiU2NyaXB0L0hlbHBlcnMuanMiLCJTY3JpcHQvTW9uc3Rlci5qcyIsIlNjcmlwdC9QZXJzaXN0Tm9kZS5qcyIsIlNjcmlwdC9TdGFnZUNyZWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNjU2YmREYitsRklGb2FYTjFPaEJhL0snLCAnQmxvY2snKTtcbi8vIFNjcmlwdC9CbG9jay5qc1xuXG5jYy5DbGFzcyh7XG4gIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgcHJvcGVydGllczogZnVuY3Rpb24gcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgREVGQVVMVF9QT1NJVElPTl9YOiB7XG4gICAgICAgIFwiZGVmYXVsdFwiOiAtNDUwXG4gICAgICB9LFxuICAgICAgLy/ov5nph4zpg73mmK/pu5jorqTlgLxcbiAgICAgIG1TcGVlZDogMCxcbiAgICAgIC8vIOS4u+inkui3s+i3g+mrmOW6plxuICAgICAgbUp1bXBIZWlnaHQ6IDAsXG4gICAgICAvLyDkuLvop5Lot7Pot4PmjIHnu63ml7bpl7RcbiAgICAgIG1KdW1wRHVyYXRpb246IDBcbiAgICB9O1xuICB9LFxuXG4gIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5ub2RlLnNjYWxlWCA9IC0xO1xuICAgIC8v56eB5pyJ5Y+Y6YePXG4gICAgc2VsZi5qdW1wQWN0aW9uID0gc2VsZi5jcmVhdGVKdW1wQWN0aW9uKCk7XG4gICAgc2VsZi5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICBzZWxmLm1HYW1lOyAvL0Zyb20gR2FtZVxuXG4gICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWQgPSB0cnVlO1xuICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkRGVidWdEcmF3ID0gZmFsc2U7XG4gICAgdGhpcy50b3VjaGluZ051bWJlciA9IDA7XG5cbiAgICAvL2FkZCBrZXlib2FyZCBpbnB1dCBsaXN0ZW5lciB0byBjYWxsIHR1cm5MZWZ0IGFuZCB0dXJuUmlnaHRcbiAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoe1xuICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuS0VZQk9BUkQsXG4gICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uIG9uS2V5UHJlc3NlZChrZXlDb2RlLCBldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIGNjLktFWS5zcGFjZTpcbiAgICAgICAgICAgIHNlbGYuanVtcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBzZWxmLm5vZGUpO1xuICAgIC8v5re75Yqg54K55Ye75LqL5Lu2XG4gICAgaWYgKHNlbGYubUdhbWUgIT0gbnVsbCkge1xuICAgICAgc2VsZi5tR2FtZS5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCB0aGlzLm9uR2FtZVZpZXdDbGljay5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH0sXG5cbiAgb25HYW1lVmlld0NsaWNrOiBmdW5jdGlvbiBvbkdhbWVWaWV3Q2xpY2soKSB7XG4gICAgdGhpcy5qdW1wKCk7XG4gIH0sXG5cbiAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIiB1cGRhdGUgXCIrZHQrICB0aGlzLm5vZGUucG9zaXRpb24rXCIgIFwiK3RoaXMubVNwZWVkKTtcblxuICAgIGlmICh0aGlzLm1HYW1lICYmICF0aGlzLm1HYW1lLmlzUGF1c2UpIHtcbiAgICAgIHZhciBvbmVNb3ZlID0gdGhpcy5tU3BlZWQgKiBkdDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwib25lTW92ZTpcIitvbmVNb3ZlK1wiIFwiK3RoaXMubVNwZWVkKTtcbiAgICAgIHRoaXMubm9kZS54ICs9IG9uZU1vdmU7XG4gICAgfVxuICB9LFxuICBjcmVhdGVKdW1wQWN0aW9uOiBmdW5jdGlvbiBjcmVhdGVKdW1wQWN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwianVtcFwiKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyDot7Pot4PkuIrljYdcbiAgICB0aGlzLm1vdmVVcEFjdGlvbiA9IGNjLm1vdmVCeSh0aGlzLm1KdW1wRHVyYXRpb24sIGNjLnAoMCwgdGhpcy5tSnVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XG4gICAgdGhpcy5yb3RhdGUxODBBY3Rpb24gPSBjYy5yb3RhdGVCeSh0aGlzLm1KdW1wRHVyYXRpb24sIDkwKTtcbiAgICB0aGlzLm1vdmVEb3duQWN0aW9uID0gY2MubW92ZUJ5KHRoaXMubUp1bXBEdXJhdGlvbiwgY2MucCgwLCAtdGhpcy5tSnVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25JbigpKTtcbiAgICB0aGlzLnVwQW5kUm90YXRlID0gY2Muc3Bhd24odGhpcy5tb3ZlVXBBY3Rpb24sIHRoaXMucm90YXRlMTgwQWN0aW9uKTtcbiAgICB0aGlzLmRvd25BbmRSb3RhdGUgPSBjYy5zcGF3bih0aGlzLm1vdmVEb3duQWN0aW9uLCB0aGlzLnJvdGF0ZTE4MEFjdGlvbik7XG4gICAgdmFyIG9uQWN0aW9uRmluaXNoZWQgPSBjYy5jYWxsRnVuYyhmdW5jdGlvbiAodGFyZ2V0LCBzY29yZSkge1xuICAgICAgc2VsZi5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICB9LCB0aGlzLCAxMDApOyAvL+WKqOS9nOWujOaIkOWQjuS8mue7meeOqeWutuWKoDEwMOWIhlxuICAgIHJldHVybiBjYy5zZXF1ZW5jZSh0aGlzLnVwQW5kUm90YXRlLCB0aGlzLmRvd25BbmRSb3RhdGUsIG9uQWN0aW9uRmluaXNoZWQpO1xuICB9LFxuICBqdW1wOiBmdW5jdGlvbiBqdW1wKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5pc0p1bXBpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5pc0p1bXBpbmcgPSB0cnVlO1xuICAgIHRoaXMubm9kZS5ydW5BY3Rpb24odGhpcy5qdW1wQWN0aW9uKTtcbiAgfSxcbiAgcmVzZXRTZWxmOiBmdW5jdGlvbiByZXNldFNlbGYoKSB7XG4gICAgLy9zZWxmLm1HYW1lID0gdGhpcy5nZXRDb21wb25lbnQoXCJHYW1lXCIpO1xuICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICB0aGlzLm5vZGUueCA9IHRoaXMuREVGQVVMVF9QT1NJVElPTl9YO1xuICAgIGlmICghIXRoaXMubUdhbWUpIHtcbiAgICAgIHRoaXMubm9kZS55ID0gdGhpcy5tR2FtZS5nZXRHcm91bmRZKHRoaXMubm9kZSk7XG4gICAgICBjb25zb2xlLmxvZyhcInJlc2V0U2VsZiB5PVwiICsgdGhpcy5ub2RlLnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJyZXNldFNlbGYgbUdhbWUgaXMgbnVsbFwiKTtcbiAgICB9XG4gICAgdGhpcy5ub2RlLnNldFJvdGF0aW9uKDApO1xuICAgIHRoaXMuaXNKdW1waW5nID0gZmFsc2U7XG4gICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gIH0sXG4gIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRW50ZXIob3RoZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIm9uQ29sbGlzaW9uRW50ZXIgXCIpO1xuICAgIHRoaXMubm9kZS5jb2xvciA9IGNjLkNvbG9yLlJFRDtcbiAgICB0aGlzLnRvdWNoaW5nTnVtYmVyKys7XG5cbiAgICB0aGlzLnJlc2V0U2VsZigpO1xuICAgIHRoaXMubUdhbWUubG9zc0xpZmUoKTtcbiAgfSxcblxuICBvbkNvbGxpc2lvblN0YXk6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uU3RheShvdGhlcikge1xuICAgIC8vIGNvbnNvbGUubG9nKCdvbiBjb2xsaXNpb24gc3RheScpO1xuICB9LFxuXG4gIG9uQ29sbGlzaW9uRXhpdDogZnVuY3Rpb24gb25Db2xsaXNpb25FeGl0KCkge1xuICAgIHRoaXMudG91Y2hpbmdOdW1iZXItLTtcbiAgICBpZiAodGhpcy50b3VjaGluZ051bWJlciA9PT0gMCkge1xuICAgICAgdGhpcy5ub2RlLmNvbG9yID0gY2MuQ29sb3IuV0hJVEU7XG4gICAgfVxuICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2E0ZTgyR0trWmhKVHJhc0sxdXROR3BJJywgJ0RiJyk7XG4vLyBTY3JpcHQvRGIuanNcblxuLyoqXG4gKiBDcmVhdGVkIGJ5IGZ1cWlhbmcgb24gMjAxNi8xMC8xNi5cbiAqL1xuXG52YXIgZGIgPSB7XG4gIHB1dDogZnVuY3Rpb24gcHV0KGtleSwgdmFsKSB7XG4gICAgY29uc29sZS5sb2coXCJwdXQgOlwiICsga2V5ICsgXCIgIFwiICsgdmFsKTtcbiAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWwpO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhcImdldDpcIiArIGtleSk7XG4gICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRiO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnZGYzZmJrNzVRUkdzSTVLcTFnTmozNDEnLCAnR2FtZU92ZXInKTtcbi8vIFNjcmlwdC9HYW1lT3Zlci5qc1xuXG52YXIgR2xvYmFsID0gcmVxdWlyZSgnR2xvYmFsJyk7XG52YXIgRGIgPSByZXF1aXJlKCdEYicpO1xudmFyIEtfREFUQSA9IFwiS2V5X29mX2RhdGFcIjtcblxuY2MuQ2xhc3Moe1xuICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbVRpdGxlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbVNjb3JlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbVJlc3RhcnRCdG46IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICB9LFxuICAgIG1TdGFnZUxhYmVsOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH1cbiAgfSxcblxuICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgY29uc29sZS5sb2coXCJvbkxvYWQgR2FtZU92ZXIgXCIgKyBHbG9iYWwuZ2FtZU92ZXJBcmcudHJ5dGltZXMpO1xuICAgIC8vZGlzcGxheVxuICAgIHRoaXMubVNjb3JlLnN0cmluZyA9IFwiU2NvcmU6IFwiICsgR2xvYmFsLmdhbWVPdmVyQXJnLnNjb3JlO1xuICAgIHZhciB0cnlUaW1lc1N0cmluZyA9IFwiVHJ5VGltZXM6IFwiICsgR2xvYmFsLmdhbWVPdmVyQXJnLnRyeXRpbWVzO1xuICAgIHRoaXMubVN0YWdlTGFiZWwuc3RyaW5nID0gXCJTdGFnZTogXCIgKyBHbG9iYWwuZ2FtZU92ZXJBcmcuc3RhZ2UgfHwgMDtcbiAgICAvL3NhdmUgdG8gbG9jYWxcbiAgICB0aGlzLnNhdmVUb0xvY2FsKEdsb2JhbC5nYW1lT3ZlckFyZy5zY29yZSwgR2xvYmFsLmdhbWVPdmVyQXJnLnRyeXRpbWVzLCBHbG9iYWwuZ2FtZU92ZXJBcmcuc3RhZ2UpO1xuICAgIHZhciBsYXN0RGF0YSA9IHRoaXMucmVhZExvY2FsRGF0YSgpO1xuICAgIHRyeVRpbWVzU3RyaW5nICs9IFwiXFxuXFxuIExhc3RUaW1lOlxcbiBTY29yZTpcIiArIGxhc3REYXRhLnNjb3JlICsgXCIgXFxuVHJ5VGltZXM6IFwiICsgbGFzdERhdGEudHJ5dGltZXM7XG5cbiAgICAvL+e7keWumuS6i+S7tlxuICAgIHRoaXMubVJlc3RhcnRCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uUmVzdGFydENsaWNrLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7fSxcblxuICBvblJlc3RhcnRDbGljazogZnVuY3Rpb24gb25SZXN0YXJ0Q2xpY2soKSB7XG4gICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdHYW1lTWFpbicpO1xuICB9LFxuXG4gIHNhdmVUb0xvY2FsOiBmdW5jdGlvbiBzYXZlVG9Mb2NhbChzY29yZSwgdHJ5dGltZXMsIHN0YWdlKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBzY29yZTogc2NvcmUsXG4gICAgICB0cnl0aW1lczogdHJ5dGltZXMsXG4gICAgICBzdGFnZTogc3RhZ2VcbiAgICB9O1xuICAgIERiLnB1dChLX0RBVEEsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgfSxcbiAgcmVhZExvY2FsRGF0YTogZnVuY3Rpb24gcmVhZExvY2FsRGF0YSgpIHtcbiAgICB2YXIgbG9jYWxEYXRhID0gSlNPTi5wYXJzZShEYi5nZXQoS19EQVRBKSk7XG4gICAgY29uc29sZS5sb2coXCJsb2NhbERhdGEgXCIgKyBKU09OLnN0cmluZ2lmeShsb2NhbERhdGEpKTtcbiAgICBsb2NhbERhdGEgPSAhbG9jYWxEYXRhID8geyBzY29yZTogMCwgdHJ5dGltZXM6IDAsIHN0YWdlOiAxIH0gOiBsb2NhbERhdGE7XG4gICAgcmV0dXJuIGxvY2FsRGF0YTtcbiAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcyYTZkOWlLZ0ZOREJJMnpaOTRQcFZRVycsICdHYW1lJyk7XG4vLyBTY3JpcHQvR2FtZS5qc1xuXG52YXIgSGVscGVycyA9IHJlcXVpcmUoJ0hlbHBlcnMnKTtcbnZhciBHbG9iYWwgPSByZXF1aXJlKCdHbG9iYWwnKTtcbnZhciBTdGFnZUNyZWF0b3IgPSByZXF1aXJlKCdTdGFnZUNyZWF0b3InKTtcblxuY2MuQ2xhc3Moe1xuICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbUJsb2NrOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBtR3JvdW5kOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBtTW9uc3RlckJsb2NrUHJlZnM6IHtcbiAgICAgICdkZWZhdWx0JzogW10sXG4gICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICB9LFxuICAgIHJhbmRvbVJhbmdlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB4OiA1MDAsXG4gICAgICB5OiAyMDBcbiAgICB9LFxuICAgIG1TY29yZUxhYmVsOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbVRyeVRpbWVzTGFiZWw6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgfSxcbiAgICBtU2NvcmU6IDAsXG4gICAgbVRyeVRpbWVzOiB7XG4gICAgICAnZGVmYXVsdCc6IDIwLFxuICAgICAgdHlwZTogY2MuSW50ZWdlclxuICAgIH0sXG4gICAgbU1pZGRsZU5vZGU6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgRU5EX1BPU0lUSU9OOiB7XG4gICAgICAnZGVmYXVsdCc6IDUwMFxuICAgIH0sXG4gICAgbUN1cnJlbnRTdGFnZToge1xuICAgICAgJ2RlZmF1bHQnOiAxLFxuICAgICAgdHlwZTogY2MuSW50ZWdlclxuICAgIH0sXG4gICAgbVN0YWdlVmFsdWVOb2RlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH1cbiAgfSxcblxuICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vc2VsZi5jcmVhdGVSYW1kb21Nb25zdGVyKCk7XG4gICAgc2VsZi5tQmxvY2tDb21wID0gc2VsZi5tQmxvY2suZ2V0Q29tcG9uZW50KFwiQmxvY2tcIik7XG4gICAgc2VsZi5tQmxvY2tDb21wLm1HYW1lID0gdGhpcztcbiAgfSxcblxuICBzdGFydDogZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQtcmVzZXRCbG9ja1wiKTtcbiAgICBTdGFnZUNyZWF0b3IuaW5pdCh0aGlzLm5vZGUsIHNlbGYubUdyb3VuZCwgc2VsZi5tTW9uc3RlckJsb2NrUHJlZnMpO1xuICAgIFN0YWdlQ3JlYXRvci5jcmVhdGUodGhpcy5tQ3VycmVudFN0YWdlKTtcbiAgICBzZWxmLnJlc2V0QmxvY2soKTtcbiAgICB0aGlzLm1UcnlUaW1lc0xhYmVsLnN0cmluZyA9IHRoaXMubVRyeVRpbWVzO1xuICB9LFxuICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgIGlmICh0aGlzLm1CbG9jay54ID4gdGhpcy5FTkRfUE9TSVRJT04pIHtcbiAgICAgIHRoaXMubUJsb2NrLnggPSB0aGlzLm1CbG9ja0NvbXAuREVGQVVMVF9QT1NJVElPTl9YO1xuICAgICAgdGhpcy5hZGRTdGFnZSgpO1xuICAgICAgdGhpcy5hZGRMaWZlKCk7XG4gICAgICBTdGFnZUNyZWF0b3IuY2xlYXJTdGFnZSgpO1xuICAgICAgU3RhZ2VDcmVhdG9yLmNyZWF0ZSh0aGlzLm1DdXJyZW50U3RhZ2UpO1xuICAgIH1cbiAgfSxcblxuICBpbml0TW9uc3RlcnM6IGZ1bmN0aW9uIGluaXRNb25zdGVycygpIHt9LFxuXG4gIGdldEdyb3VuZFk6IGZ1bmN0aW9uIGdldEdyb3VuZFkobm9kZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvL1N0YWdlQ3JlYXRvci5pbml0KHRoaXMubm9kZSwgc2VsZi5tR3JvdW5kLCBzZWxmLm1Nb25zdGVyQmxvY2tQcmVmcyk7XG4gICAgcmV0dXJuIFN0YWdlQ3JlYXRvci5nZXRHcm91bmRZKG5vZGUpO1xuICB9LFxuXG4gIHJlc2V0QmxvY2s6IGZ1bmN0aW9uIHJlc2V0QmxvY2soKSB7XG4gICAgY29uc29sZS5sb2coXCJHYW1lICByZXNldEJsb2NrIHRyeTpcIiArIHRoaXMubVRyeVRpbWVzKTtcbiAgICB2YXIgYmxvY2tDb21wID0gdGhpcy5tQmxvY2tDb21wO1xuICAgIGlmICghIWJsb2NrQ29tcCkge1xuICAgICAgYmxvY2tDb21wLm1HYW1lID0gdGhpcztcbiAgICAgIGJsb2NrQ29tcC5yZXNldFNlbGYoKTtcbiAgICB9XG4gIH0sXG5cbiAgbG9zc0xpZmU6IGZ1bmN0aW9uIGxvc3NMaWZlKCkge1xuICAgIGNvbnNvbGUubG9nKFwibG9zc0xpZmUgXCIgKyB0aGlzLm1UcnlUaW1lcyk7XG4gICAgdGhpcy5tVHJ5VGltZXMtLTtcbiAgICBpZiAodGhpcy5tVHJ5VGltZXMgPD0gMCkge1xuICAgICAgLy9Zb3UgTG9zc1xuICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1UcnlUaW1lc0xhYmVsLnN0cmluZyA9IHRoaXMubVRyeVRpbWVzO1xuICAgIH1cbiAgfSxcblxuICBhZGRMaWZlOiBmdW5jdGlvbiBhZGRMaWZlKCkge1xuICAgIHRoaXMubVRyeVRpbWVzKys7XG4gICAgdGhpcy5tVHJ5VGltZXNMYWJlbC5zdHJpbmcgPSB0aGlzLm1UcnlUaW1lcztcbiAgfSxcblxuICBhZGRTdGFnZTogZnVuY3Rpb24gYWRkU3RhZ2UoKSB7XG4gICAgdGhpcy5tQ3VycmVudFN0YWdlKys7XG4gICAgdGhpcy5tU3RhZ2VWYWx1ZU5vZGUuc3RyaW5nID0gdGhpcy5tQ3VycmVudFN0YWdlO1xuICB9LFxuICBnYW1lT3ZlcjogZnVuY3Rpb24gZ2FtZU92ZXIoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMubUJsb2NrLnN0b3BBbGxBY3Rpb25zKCk7IC8v5YGc5q2iIHBsYXllciDoioLngrnnmoTot7Pot4PliqjkvZxcbiAgICBHbG9iYWwuZ2FtZU92ZXJBcmcuc2NvcmUgPSB0aGlzLm1TY29yZTtcbiAgICBHbG9iYWwuZ2FtZU92ZXJBcmcuc3RhZ2UgPSB0aGlzLm1DdXJyZW50U3RhZ2U7XG4gICAgR2xvYmFsLmdhbWVPdmVyQXJnLnRyeXRpbWVzID0gdGhpcy5tVHJ5VGltZXM7XG4gICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdHYW1lT3ZlcicpO1xuICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzlhZDE0b21YbFZOUTRKem56R2hSUmp3JywgJ0dsb2JhbCcpO1xuLy8gU2NyaXB0L0dsb2JhbC5qc1xuXG4vL+WFqOWxgOWPmOmHjyznlKjmnaXkvKDpgJLlj4LmlbBcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vR2FtZU92ZXIgU2NlbmUgQXJndW1lbnRzXG4gIGdhbWVPdmVyQXJnOiB7XG4gICAgc2NvcmU6IDAsXG4gICAgdHJ5dGltZXM6IDBcbiAgfVxufTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzFmYzllWTg3bnhIWDRKdU9zb2xEVHRnJywgJ0hlbHBlcnMnKTtcbi8vIFNjcmlwdC9IZWxwZXJzLmpzXG5cbnZhciBIZWxwZXJzID0ge1xuICAgIGdldFJhbmRvbUludDogZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1heCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoY2MucmFuZG9tMFRvMSgpICogbWF4KTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlbHBlcnM7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc1NmE0Y3JHYmF0RUpwZWhXN2haT3VNRCcsICdNb25zdGVyJyk7XG4vLyBTY3JpcHQvTW9uc3Rlci5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWREZWJ1Z0RyYXcgPSB0cnVlO1xuICAgICAgICB0aGlzLnRvdWNoaW5nTnVtYmVyID0gMDtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge30sXG4gICAgb25Db2xsaXNpb25FbnRlcjogZnVuY3Rpb24gb25Db2xsaXNpb25FbnRlcihvdGhlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uQ29sbGlzaW9uRW50ZXIgXCIpO1xuICAgICAgICB0aGlzLm5vZGUuY29sb3IgPSBjYy5Db2xvci5SRUQ7XG4gICAgICAgIHRoaXMudG91Y2hpbmdOdW1iZXIrKztcbiAgICB9LFxuXG4gICAgb25Db2xsaXNpb25TdGF5OiBmdW5jdGlvbiBvbkNvbGxpc2lvblN0YXkob3RoZXIpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ29uIGNvbGxpc2lvbiBzdGF5Jyk7XG4gICAgfSxcblxuICAgIG9uQ29sbGlzaW9uRXhpdDogZnVuY3Rpb24gb25Db2xsaXNpb25FeGl0KCkge1xuICAgICAgICB0aGlzLnRvdWNoaW5nTnVtYmVyLS07XG4gICAgICAgIGlmICh0aGlzLnRvdWNoaW5nTnVtYmVyID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuY29sb3IgPSBjYy5Db2xvci5XSElURTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNmMxZWRJZU9rMUhiNklVdTVSOHBoVEonLCAnUGVyc2lzdE5vZGUnKTtcbi8vIFNjcmlwdC9QZXJzaXN0Tm9kZS5qc1xuXG5jYy5DbGFzcyh7XG4gIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgcHJvcGVydGllczoge1xuICAgIC8vIGZvbzoge1xuICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgIC8vIH0sXG4gICAgLy8gLi4uXG4gIH0sXG5cbiAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG5cbiAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAvLyB9LFxuXG4gIHNldEdhbWVPdmVyQXJnOiBmdW5jdGlvbiBzZXRHYW1lT3ZlckFyZyhhcmcpIHtcbiAgICB0aGlzLmdhbWVPdmVyQXJnID0gYXJnO1xuICB9LFxuICBnZXRHYW1lT3ZlckFyZzogZnVuY3Rpb24gZ2V0R2FtZU92ZXJBcmcoKSB7XG4gICAgdmFyIGEgPSB0aGlzLmdhbWVPdmVyQXJnO1xuICAgIHRoaXMuZ2FtZU92ZXJBcmcgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGE7XG4gIH1cblxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdmODMwMUM3U3JwUDNxaE1WUUR4aWlVTicsICdTdGFnZUNyZWF0b3InKTtcbi8vIFNjcmlwdC9TdGFnZUNyZWF0b3IuanNcblxuLyoqXG4gKlxuICogVE9ETzpcbiAqIOavj+S4qumanOeijeeJqeiuvue9ruS4gOS4qumavuW6puWAvCzmr4/kuKrlhbPljaHmnInkuIDkuKrpmr7luqblgLws6ZqP5py655Sf5oiQ6Zqc56KN54mp5p2l57uE5oiQ5LiA5Liq5YWz5Y2hXG4gKlxuICogVE9ETzog5ri45oiP6IqC5aWP5Y+Y5YyWXG4gKiDpmo/nnYDlhbPljaHlop7liqDpmr7luqbopoHliqDlpKdcbiAqICDmr5TlpoI6IDEs6YCf5bqm5aKe5YqgLOaWueWdl+i3neemu+WKoOWkp1xuICogICAgICAgIDIsIOaWueWdl+i3neemu+WHj+Wwj1xuICogICAgICAgICAzLCDlop7liqDnu4TlkIjpmpznoo3nialcbiAqXG4gKiDlhbPljaHnlJ/miJDlmahcbiAqIENyZWF0ZWQgYnkgZnVxaWFuZyBvbiAyMDE2LzEwLzE3LlxuICovXG52YXIgSGVscGVycyA9IHJlcXVpcmUoJ0hlbHBlcnMnKTtcbnZhciBpbnN0YW5jZSA9IHVuZGVmaW5lZDtcbnZhciBtR2FtZU5vZGUsIG1Hcm91bmROb2RlLCBtTW9uc3RlclByZWZhYnM7XG52YXIgbUdyb3VuZFkgPSAwO1xuXG52YXIgTU9OU1RFUl9UQUcgPSAweDEwMDA7XG5cbnZhciBtTW9uc3RlcnMgPSBbXTtcblxuLyoqXG4gKiDliJvlu7rlhbPljaFcbiAqIEBwYXJhbSBzdGFnZVxuICovXG5mdW5jdGlvbiBjcmVhdGUoc3RhZ2UpIHtcbiAgY29uc29sZS5sb2coXCJjcmVhdGVTdGFnZSBcIiArIHN0YWdlKTtcblxuICAvL2RlZmF1bHRcbiAgdmFyIHggPSA1MDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFnZTsgaSsrKSB7XG4gICAgeCA9IDUwICsgY2MucmFuZG9tTWludXMxVG8xKCkgKiA0NTA7XG4gICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3Rlcih4KSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdMZWZ0KHJhbmRvbSkge1xuICByYW5kb20gPSByYW5kb20gfHwgMDtcbiAgcmV0dXJuIC0xNzAgKyBIZWxwZXJzLmdldFJhbmRvbUludChyYW5kb20pO1xufVxuZnVuY3Rpb24gZ01pZGRsZShyYW5kb20pIHtcbiAgcmFuZG9tID0gcmFuZG9tIHx8IDA7XG4gIHJldHVybiA3MCArIEhlbHBlcnMuZ2V0UmFuZG9tSW50KHJhbmRvbSk7XG59XG5mdW5jdGlvbiBnUmlnaHQocmFuZG9tKSB7XG4gIHJhbmRvbSA9IHJhbmRvbSB8fCAwO1xuICByZXR1cm4gMzAwICsgSGVscGVycy5nZXRSYW5kb21JbnQocmFuZG9tKTtcbn1cblxuLyoqXG4gKiDliJvlu7rmtYvor5VTdGFnZVxuICpcbiAqIEBwYXJhbSBzdGFnZVxuICovXG5mdW5jdGlvbiBjcmVhdGVUZXN0U3RhZ2Uoc3RhZ2UpIHtcbiAgdmFyIHggPSA1MDtcbiAgdmFyIG1pblggPSAtMjAwO1xuICB2YXIgbWluU3BsaXQgPSAxNzAgKyBIZWxwZXJzLmdldFJhbmRvbUludCg1MCk7XG4gIHZhciBwb3NYID0gbWluWDtcblxuICB2YXIgZGlzdGVuY2VMdjEgPSAyMjA7XG4gIHZhciBkaXN0ZW5jZUx2MiA9IDIwMDtcbiAgdmFyIGRpc3RlbmNlTHYzID0gMTkwO1xuICB2YXIgZGlzdGVuY2VMdk1heCA9IDE3MDtcblxuICAvL3Rlc3RcbiAgc3RhZ2UgPSA0MDtcbiAgc3dpdGNoIChzdGFnZSkge1xuICAgIGNhc2UgMTpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBwb3NYID0gZ01pZGRsZSgtMjApKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1sxXSwgcG9zWCA9IGdNaWRkbGUoMTApKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1syXSwgcG9zWCA9IGdNaWRkbGUoMTApKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgcG9zWCA9IGdMZWZ0KDIwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMl0sIHBvc1ggPSBnUmlnaHQoKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA1OlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMV0sIHBvc1ggPSBnTGVmdCgyMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzJdLCBwb3NYID0gZ1JpZ2h0KCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNjpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBwb3NYID0gZ0xlZnQoMjApKSk7XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1sxXSwgcG9zWCA9IGdSaWdodCg0MCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vdGVzdCBmb3IgZGlzdGVuY2VcbiAgICBjYXNlIDc6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgcG9zWCA9IGdMZWZ0KDUwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMl0sIHBvc1ggPSBnTWlkZGxlKDMwKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA4OlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMV0sIHBvc1ggPSBnTGVmdCgyMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBwb3NYID0gZ01pZGRsZSgyMCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgOTpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzJdLCBwb3NYID0gZ01pZGRsZSgzMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzFdLCBwb3NYID0gZ1JpZ2h0KDUwKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxMDpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBnTGVmdCgtMjApKSk7XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1sxXSwgZ01pZGRsZSgwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMl0sIGdSaWdodCgyMCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoc3RhZ2UgPCAyMCkge1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdMZWZ0KC0xMCksIDMpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTWlkZGxlKDIwKSkpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdSaWdodCg4MCksIDMpKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhZ2UgPCAzMCkge1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdMZWZ0KC0xMCksIDMpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTWlkZGxlKDcwKSkpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdSaWdodCg1MCksIDMpKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhZ2UgPCA0MCkge1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdMZWZ0KDIwKSwgMykpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdNaWRkbGUoMTApKSk7XG4gICAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZVJhbmRvbU1vbnN0ZXIoZ1JpZ2h0KDgwKSwgMykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTGVmdCg0MCksIDMpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTWlkZGxlKDM1KSkpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdSaWdodCgxMCksIDMpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKlxuICog5Yib5bu66ZqP5py65pWM5Lq6XG4gKiBAcGFyYW0geCAgICAgICDkvY3nva5cbiAqIEBwYXJhbSBub0luZGV4IOmZpG5vSW5kZXjkuYvlpJZcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBjcmVhdGVSYW5kb21Nb25zdGVyKHgsIG5vSW5kZXgpIHtcbiAgdmFyIGluZGV4ID0gSGVscGVycy5nZXRSYW5kb21JbnQobU1vbnN0ZXJQcmVmYWJzLmxlbmd0aCk7XG4gIHdoaWxlIChub0luZGV4ID09IGluZGV4KSB7XG4gICAgaW5kZXggPSBIZWxwZXJzLmdldFJhbmRvbUludChtTW9uc3RlclByZWZhYnMubGVuZ3RoKTtcbiAgfVxuICBjb25zb2xlLmxvZyhcImluZGV4IDpcIiArIGluZGV4KTtcbiAgcmV0dXJuIGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzW2luZGV4XSwgeCk7XG59XG5cbi8qKlxuICog5Yib5bu6TW9uc3RlclxuICogQHBhcmFtIG1vbnN0ZXJQcmVmYWJcbiAqL1xuZnVuY3Rpb24gY3JlYXRlTW9uc3RlcihwcmVmYWIsIHgpIHtcbiAgY2MubG9nKFwiY3JlYXRlTW9uc3RlciBcIiArIHgpO1xuICB2YXIgbW9uc3RlciA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XG4gIG1HYW1lTm9kZS5hZGRDaGlsZChtb25zdGVyKTtcbiAgdmFyIHkgPSBnZXRHcm91bmRZKG1vbnN0ZXIpO1xuICBtb25zdGVyLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpO1xuICBtb25zdGVyLnRhZyA9IE1PTlNURVJfVEFHO1xuICBjb25zb2xlLmxvZyhcIm1vbnN0ZXI6XCIgKyBtb25zdGVyLnggKyBcIiAgICBcIiArIG1vbnN0ZXIueSk7XG4gIHJldHVybiBtb25zdGVyO1xufVxuXG5mdW5jdGlvbiBjbGVhclN0YWdlKCkge1xuICBjb25zb2xlLmxvZyhcImNsZWFyU3RhZ2UgcmVtb3ZlIG1vbnN0ZXIgY291bnQ6XCIgKyBtTW9uc3RlcnMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtTW9uc3RlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBtR2FtZU5vZGUucmVtb3ZlQ2hpbGQobU1vbnN0ZXJzW2ldKTtcbiAgfVxuICBtTW9uc3RlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiDojrflj5blnLDpnaLpq5jluqZcbiAqIEBwYXJhbSBtb25zdGVyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRHcm91bmRZKG1vbnN0ZXIpIHtcbiAgY29uc29sZS5sb2cobW9uc3RlciArIFwiIFwiICsgbUdyb3VuZE5vZGUgKyBcIiAgXCIgKyBtR2FtZU5vZGUpO1xuICBjb25zb2xlLmxvZyhtR3JvdW5kTm9kZS5oZWlnaHQgKyAnKyAgJyArIG1vbnN0ZXIuaGVpZ2h0ICsgXCIvMi0gXCIgKyBtR2FtZU5vZGUuaGVpZ2h0ICsgXCIvMlwiKTtcbiAgcmV0dXJuIG1Hcm91bmROb2RlLnkgKyBtR3JvdW5kTm9kZS5oZWlnaHQgLyAyICsgbW9uc3Rlci5oZWlnaHQgLyAyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uIGluaXQoYUdhbWVOb2RlLCBhR3JvdW5kTm9kZSwgYU1vbnN0ZXJQcmVmYWJzKSB7XG4gICAgbUdhbWVOb2RlID0gYUdhbWVOb2RlO1xuICAgIG1Hcm91bmROb2RlID0gYUdyb3VuZE5vZGU7XG4gICAgbU1vbnN0ZXJQcmVmYWJzID0gYU1vbnN0ZXJQcmVmYWJzO1xuICB9LFxuICAvL3Rlc3RcbiAgY3JlYXRlOiBjcmVhdGVUZXN0U3RhZ2UsIC8vY3JlYXRlXG4gIC8vY3JlYXRlOiBjcmVhdGUsXG4gIGNsZWFyU3RhZ2U6IGNsZWFyU3RhZ2UsXG4gIGdldEdyb3VuZFk6IGdldEdyb3VuZFlcbn07XG5cbmNjLl9SRnBvcCgpOyJdfQ==
