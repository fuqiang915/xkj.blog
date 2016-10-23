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
  },
  pause: function pause() {}
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
var Log = require("Log");

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
    },
    mAudioPlayer: {
      'default': null,
      type: cc.AudioSource
    },
    mAudioPause: {
      'default': null,
      url: cc.AudioClip
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
    if (this.mIsPaused) {
      return;
    }
    this.mIsPaused = true;
    //this.mBlock.active = false;
    this.mPauseView.active = true;
    cc.audioEngine.playEffect(this.mAudioPause, false);
    this.mAudioPlayer.pause();
    this.node.enable = false;
    Log.d("pause director");
    cc.director.pause();
  },
  onResumeClick: function onResumeClick() {
    if (!this.mIsPaused) {
      return;
    }
    this.mPauseView.active = false;
    cc.director.resume();
    this.mAudioPlayer.resume();
    this.mIsPaused = false;
  },
  //弃用
  startResumeCountDown: function startResumeCountDown() {
    Log.d("Start CountDown");
    cc.director.getScheduler().schedule(this.resumeCountDownCallback, this, 3, 1, 1, true);
  },
  //弃用
  resumeCountDownCallback: function resumeCountDownCallback() {
    this.node.enable = true;
    Log.d("resume director");
    cc.director.resume();
    this.mAudioPlayer.resume();
    this.mIsPaused = false;
  }

});

cc._RFpop();
},{"Global":"Global","Helpers":"Helpers","Log":"Log","StageCreator":"StageCreator"}],"Global":[function(require,module,exports){
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
},{}],"Log":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'b990727469IEo/8qUqJygPZ', 'Log');
// Script/Log.js

/**
 * Created by fuqiang on 2016/10/23.
 */

module.exports = {
  debug: true,
  setDebug: function setDebug(isDebug) {
    this.debug = isDebug;
  },

  d: function d() {
    if (!this.debug) return;
    if (arguments.length == 1) {
      console.log(arguments[0]);
    } else {
      var msg = "";
      for (var i = 0; i < arguments.length; i++) {
        msg = msg + JSON.stringify(arguments[i]) + " ";
      }
      console.log(msg);
    }
  }
};

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
},{"Helpers":"Helpers"}]},{},["Helpers","Game","Monster","Block","PersistNode","Global","Db","Log","GameOver","StageCreator"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiU2NyaXB0L0Jsb2NrLmpzIiwiU2NyaXB0L0RiLmpzIiwiU2NyaXB0L0dhbWVPdmVyLmpzIiwiU2NyaXB0L0dhbWUuanMiLCJTY3JpcHQvR2xvYmFsLmpzIiwiU2NyaXB0L0hlbHBlcnMuanMiLCJTY3JpcHQvTG9nLmpzIiwiU2NyaXB0L01vbnN0ZXIuanMiLCJTY3JpcHQvUGVyc2lzdE5vZGUuanMiLCJTY3JpcHQvU3RhZ2VDcmVhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNjU2YmREYitsRklGb2FYTjFPaEJhL0snLCAnQmxvY2snKTtcbi8vIFNjcmlwdC9CbG9jay5qc1xuXG5jYy5DbGFzcyh7XG4gIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgcHJvcGVydGllczogZnVuY3Rpb24gcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgREVGQVVMVF9QT1NJVElPTl9YOiB7XG4gICAgICAgIFwiZGVmYXVsdFwiOiAtNDUwXG4gICAgICB9LFxuICAgICAgLy/ov5nph4zpg73mmK/pu5jorqTlgLxcbiAgICAgIG1TcGVlZDogMCxcbiAgICAgIC8vIOS4u+inkui3s+i3g+mrmOW6plxuICAgICAgbUp1bXBIZWlnaHQ6IDAsXG4gICAgICAvLyDkuLvop5Lot7Pot4PmjIHnu63ml7bpl7RcbiAgICAgIG1KdW1wRHVyYXRpb246IDBcbiAgICB9O1xuICB9LFxuXG4gIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5ub2RlLnNjYWxlWCA9IC0xO1xuICAgIC8v56eB5pyJ5Y+Y6YePXG4gICAgc2VsZi5qdW1wQWN0aW9uID0gc2VsZi5jcmVhdGVKdW1wQWN0aW9uKCk7XG4gICAgc2VsZi5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICBzZWxmLm1HYW1lOyAvL0Zyb20gR2FtZVxuXG4gICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWQgPSB0cnVlO1xuICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkRGVidWdEcmF3ID0gZmFsc2U7XG4gICAgdGhpcy50b3VjaGluZ051bWJlciA9IDA7XG5cbiAgICAvL2FkZCBrZXlib2FyZCBpbnB1dCBsaXN0ZW5lciB0byBjYWxsIHR1cm5MZWZ0IGFuZCB0dXJuUmlnaHRcbiAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoe1xuICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuS0VZQk9BUkQsXG4gICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uIG9uS2V5UHJlc3NlZChrZXlDb2RlLCBldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIGNjLktFWS5zcGFjZTpcbiAgICAgICAgICAgIHNlbGYuanVtcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBzZWxmLm5vZGUpO1xuICAgIC8v5re75Yqg54K55Ye75LqL5Lu2XG4gICAgaWYgKHNlbGYubUdhbWUgIT0gbnVsbCkge1xuICAgICAgc2VsZi5tR2FtZS5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCB0aGlzLm9uR2FtZVZpZXdDbGljay5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH0sXG5cbiAgb25HYW1lVmlld0NsaWNrOiBmdW5jdGlvbiBvbkdhbWVWaWV3Q2xpY2soKSB7XG4gICAgdGhpcy5qdW1wKCk7XG4gIH0sXG5cbiAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIiB1cGRhdGUgXCIrZHQrICB0aGlzLm5vZGUucG9zaXRpb24rXCIgIFwiK3RoaXMubVNwZWVkKTtcbiAgICBpZiAodGhpcy5tR2FtZSAmJiAhdGhpcy5tR2FtZS5pc1BhdXNlKSB7XG4gICAgICB2YXIgb25lTW92ZSA9IHRoaXMubVNwZWVkICogZHQ7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIm9uZU1vdmU6XCIrb25lTW92ZStcIiBcIit0aGlzLm1TcGVlZCk7XG4gICAgICB0aGlzLm5vZGUueCArPSBvbmVNb3ZlO1xuICAgIH1cbiAgfSxcbiAgY3JlYXRlSnVtcEFjdGlvbjogZnVuY3Rpb24gY3JlYXRlSnVtcEFjdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcImp1bXBcIik7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8g6Lez6LeD5LiK5Y2HXG4gICAgdGhpcy5tb3ZlVXBBY3Rpb24gPSBjYy5tb3ZlQnkodGhpcy5tSnVtcER1cmF0aW9uLCBjYy5wKDAsIHRoaXMubUp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uT3V0KCkpO1xuICAgIHRoaXMucm90YXRlMTgwQWN0aW9uID0gY2Mucm90YXRlQnkodGhpcy5tSnVtcER1cmF0aW9uLCA5MCk7XG4gICAgdGhpcy5tb3ZlRG93bkFjdGlvbiA9IGNjLm1vdmVCeSh0aGlzLm1KdW1wRHVyYXRpb24sIGNjLnAoMCwgLXRoaXMubUp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7XG4gICAgdGhpcy51cEFuZFJvdGF0ZSA9IGNjLnNwYXduKHRoaXMubW92ZVVwQWN0aW9uLCB0aGlzLnJvdGF0ZTE4MEFjdGlvbik7XG4gICAgdGhpcy5kb3duQW5kUm90YXRlID0gY2Muc3Bhd24odGhpcy5tb3ZlRG93bkFjdGlvbiwgdGhpcy5yb3RhdGUxODBBY3Rpb24pO1xuICAgIHZhciBvbkFjdGlvbkZpbmlzaGVkID0gY2MuY2FsbEZ1bmMoZnVuY3Rpb24gKHRhcmdldCwgc2NvcmUpIHtcbiAgICAgIHNlbGYuaXNKdW1waW5nID0gZmFsc2U7XG4gICAgfSwgdGhpcywgMTAwKTsgLy/liqjkvZzlrozmiJDlkI7kvJrnu5nnjqnlrrbliqAxMDDliIZcbiAgICByZXR1cm4gY2Muc2VxdWVuY2UodGhpcy51cEFuZFJvdGF0ZSwgdGhpcy5kb3duQW5kUm90YXRlLCBvbkFjdGlvbkZpbmlzaGVkKTtcbiAgfSxcbiAganVtcDogZnVuY3Rpb24ganVtcCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuaXNKdW1waW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuaXNKdW1waW5nID0gdHJ1ZTtcbiAgICB0aGlzLm5vZGUucnVuQWN0aW9uKHRoaXMuanVtcEFjdGlvbik7XG4gIH0sXG4gIHJlc2V0U2VsZjogZnVuY3Rpb24gcmVzZXRTZWxmKCkge1xuICAgIC8vc2VsZi5tR2FtZSA9IHRoaXMuZ2V0Q29tcG9uZW50KFwiR2FtZVwiKTtcbiAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgdGhpcy5ub2RlLnggPSB0aGlzLkRFRkFVTFRfUE9TSVRJT05fWDtcbiAgICBpZiAoISF0aGlzLm1HYW1lKSB7XG4gICAgICB0aGlzLm5vZGUueSA9IHRoaXMubUdhbWUuZ2V0R3JvdW5kWSh0aGlzLm5vZGUpO1xuICAgICAgY29uc29sZS5sb2coXCJyZXNldFNlbGYgeT1cIiArIHRoaXMubm9kZS55KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwicmVzZXRTZWxmIG1HYW1lIGlzIG51bGxcIik7XG4gICAgfVxuICAgIHRoaXMubm9kZS5zZXRSb3RhdGlvbigwKTtcbiAgICB0aGlzLmlzSnVtcGluZyA9IGZhbHNlO1xuICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xuICB9LFxuICBvbkNvbGxpc2lvbkVudGVyOiBmdW5jdGlvbiBvbkNvbGxpc2lvbkVudGVyKG90aGVyKSB7XG4gICAgY29uc29sZS5sb2coXCJvbkNvbGxpc2lvbkVudGVyIFwiKTtcbiAgICB0aGlzLm5vZGUuY29sb3IgPSBjYy5Db2xvci5SRUQ7XG4gICAgdGhpcy50b3VjaGluZ051bWJlcisrO1xuXG4gICAgdGhpcy5yZXNldFNlbGYoKTtcbiAgICB0aGlzLm1HYW1lLmxvc3NMaWZlKCk7XG4gIH0sXG5cbiAgb25Db2xsaXNpb25TdGF5OiBmdW5jdGlvbiBvbkNvbGxpc2lvblN0YXkob3RoZXIpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnb24gY29sbGlzaW9uIHN0YXknKTtcbiAgfSxcblxuICBvbkNvbGxpc2lvbkV4aXQ6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRXhpdCgpIHtcbiAgICB0aGlzLnRvdWNoaW5nTnVtYmVyLS07XG4gICAgaWYgKHRoaXMudG91Y2hpbmdOdW1iZXIgPT09IDApIHtcbiAgICAgIHRoaXMubm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFO1xuICAgIH1cbiAgfSxcbiAgcGF1c2U6IGZ1bmN0aW9uIHBhdXNlKCkge31cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnYTRlODJHS2taaEpUcmFzSzF1dE5HcEknLCAnRGInKTtcbi8vIFNjcmlwdC9EYi5qc1xuXG4vKipcbiAqIENyZWF0ZWQgYnkgZnVxaWFuZyBvbiAyMDE2LzEwLzE2LlxuICovXG5cbnZhciBkYiA9IHtcbiAgcHV0OiBmdW5jdGlvbiBwdXQoa2V5LCB2YWwpIHtcbiAgICBjb25zb2xlLmxvZyhcInB1dCA6XCIgKyBrZXkgKyBcIiAgXCIgKyB2YWwpO1xuICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbCk7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgIGNvbnNvbGUubG9nKFwiZ2V0OlwiICsga2V5KTtcbiAgICByZXR1cm4gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGI7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdkZjNmYms3NVFSR3NJNUtxMWdOajM0MScsICdHYW1lT3ZlcicpO1xuLy8gU2NyaXB0L0dhbWVPdmVyLmpzXG5cbnZhciBHbG9iYWwgPSByZXF1aXJlKCdHbG9iYWwnKTtcbnZhciBEYiA9IHJlcXVpcmUoJ0RiJyk7XG52YXIgS19EQVRBID0gXCJLZXlfb2ZfZGF0YVwiO1xuXG5jYy5DbGFzcyh7XG4gICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtVGl0bGU6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgfSxcbiAgICBtU2NvcmU6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgfSxcbiAgICBtUmVzdGFydEJ0bjoge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdHlwZTogY2MuTm9kZVxuICAgIH0sXG4gICAgbVN0YWdlTGFiZWw6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgfVxuICB9LFxuXG4gIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIm9uTG9hZCBHYW1lT3ZlciBcIiArIEdsb2JhbC5nYW1lT3ZlckFyZy50cnl0aW1lcyk7XG4gICAgLy9kaXNwbGF5XG4gICAgdGhpcy5tU2NvcmUuc3RyaW5nID0gXCJTY29yZTogXCIgKyBHbG9iYWwuZ2FtZU92ZXJBcmcuc2NvcmU7XG4gICAgdmFyIHRyeVRpbWVzU3RyaW5nID0gXCJUcnlUaW1lczogXCIgKyBHbG9iYWwuZ2FtZU92ZXJBcmcudHJ5dGltZXM7XG4gICAgdGhpcy5tU3RhZ2VMYWJlbC5zdHJpbmcgPSBcIlN0YWdlOiBcIiArIEdsb2JhbC5nYW1lT3ZlckFyZy5zdGFnZSB8fCAwO1xuICAgIC8vc2F2ZSB0byBsb2NhbFxuICAgIHRoaXMuc2F2ZVRvTG9jYWwoR2xvYmFsLmdhbWVPdmVyQXJnLnNjb3JlLCBHbG9iYWwuZ2FtZU92ZXJBcmcudHJ5dGltZXMsIEdsb2JhbC5nYW1lT3ZlckFyZy5zdGFnZSk7XG4gICAgdmFyIGxhc3REYXRhID0gdGhpcy5yZWFkTG9jYWxEYXRhKCk7XG4gICAgdHJ5VGltZXNTdHJpbmcgKz0gXCJcXG5cXG4gTGFzdFRpbWU6XFxuIFNjb3JlOlwiICsgbGFzdERhdGEuc2NvcmUgKyBcIiBcXG5UcnlUaW1lczogXCIgKyBsYXN0RGF0YS50cnl0aW1lcztcblxuICAgIC8v57uR5a6a5LqL5Lu2XG4gICAgdGhpcy5tUmVzdGFydEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25SZXN0YXJ0Q2xpY2suYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHt9LFxuXG4gIG9uUmVzdGFydENsaWNrOiBmdW5jdGlvbiBvblJlc3RhcnRDbGljaygpIHtcbiAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ0dhbWVNYWluJyk7XG4gIH0sXG5cbiAgc2F2ZVRvTG9jYWw6IGZ1bmN0aW9uIHNhdmVUb0xvY2FsKHNjb3JlLCB0cnl0aW1lcywgc3RhZ2UpIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHNjb3JlOiBzY29yZSxcbiAgICAgIHRyeXRpbWVzOiB0cnl0aW1lcyxcbiAgICAgIHN0YWdlOiBzdGFnZVxuICAgIH07XG4gICAgRGIucHV0KEtfREFUQSwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICB9LFxuICByZWFkTG9jYWxEYXRhOiBmdW5jdGlvbiByZWFkTG9jYWxEYXRhKCkge1xuICAgIHZhciBsb2NhbERhdGEgPSBKU09OLnBhcnNlKERiLmdldChLX0RBVEEpKTtcbiAgICBjb25zb2xlLmxvZyhcImxvY2FsRGF0YSBcIiArIEpTT04uc3RyaW5naWZ5KGxvY2FsRGF0YSkpO1xuICAgIGxvY2FsRGF0YSA9ICFsb2NhbERhdGEgPyB7IHNjb3JlOiAwLCB0cnl0aW1lczogMCwgc3RhZ2U6IDEgfSA6IGxvY2FsRGF0YTtcbiAgICByZXR1cm4gbG9jYWxEYXRhO1xuICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzJhNmQ5aUtnRk5EQkkyelo5NFBwVlFXJywgJ0dhbWUnKTtcbi8vIFNjcmlwdC9HYW1lLmpzXG5cbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnSGVscGVycycpO1xudmFyIEdsb2JhbCA9IHJlcXVpcmUoJ0dsb2JhbCcpO1xudmFyIFN0YWdlQ3JlYXRvciA9IHJlcXVpcmUoJ1N0YWdlQ3JlYXRvcicpO1xudmFyIExvZyA9IHJlcXVpcmUoXCJMb2dcIik7XG5cbmNjLkNsYXNzKHtcbiAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgcHJvcGVydGllczoge1xuICAgIG1CbG9jazoge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdHlwZTogY2MuTm9kZVxuICAgIH0sXG4gICAgbUdyb3VuZDoge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdHlwZTogY2MuTm9kZVxuICAgIH0sXG4gICAgbU1vbnN0ZXJCbG9ja1ByZWZzOiB7XG4gICAgICAnZGVmYXVsdCc6IFtdLFxuICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgfSxcbiAgICByYW5kb21SYW5nZToge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgeDogNTAwLFxuICAgICAgeTogMjAwXG4gICAgfSxcbiAgICBtU2NvcmVMYWJlbDoge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdHlwZTogY2MuTGFiZWxcbiAgICB9LFxuICAgIG1UcnlUaW1lc0xhYmVsOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbVNjb3JlOiAwLFxuICAgIG1UcnlUaW1lczoge1xuICAgICAgJ2RlZmF1bHQnOiAyMCxcbiAgICAgIHR5cGU6IGNjLkludGVnZXJcbiAgICB9LFxuICAgIG1NaWRkbGVOb2RlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBtUGF1c2VCdG46IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICB9LFxuXG4gICAgbVJlc3VtZUJ0bjoge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdHlwZTogY2MuTm9kZVxuICAgIH0sXG4gICAgbVBhdXNlVmlldzoge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdHlwZTogY2MuTm9kZVxuICAgIH0sXG4gICAgRU5EX1BPU0lUSU9OOiB7XG4gICAgICAnZGVmYXVsdCc6IDUwMFxuICAgIH0sXG4gICAgbUN1cnJlbnRTdGFnZToge1xuICAgICAgJ2RlZmF1bHQnOiAxLFxuICAgICAgdHlwZTogY2MuSW50ZWdlclxuICAgIH0sXG4gICAgbVN0YWdlVmFsdWVOb2RlOiB7XG4gICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICB0eXBlOiBjYy5MYWJlbFxuICAgIH0sXG4gICAgbUlzUGF1c2VkOiB7XG4gICAgICAnZGVmYXVsdCc6IGZhbHNlXG4gICAgfSxcbiAgICBtQXVkaW9QbGF5ZXI6IHtcbiAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgIHR5cGU6IGNjLkF1ZGlvU291cmNlXG4gICAgfSxcbiAgICBtQXVkaW9QYXVzZToge1xuICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICB9XG4gIH0sXG5cbiAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvL3NlbGYuY3JlYXRlUmFtZG9tTW9uc3RlcigpO1xuICAgIHNlbGYubUJsb2NrQ29tcCA9IHNlbGYubUJsb2NrLmdldENvbXBvbmVudChcIkJsb2NrXCIpO1xuICAgIHNlbGYubUJsb2NrQ29tcC5tR2FtZSA9IHRoaXM7XG4gICAgc2VsZi5tUGF1c2VCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBzZWxmLm9uUGF1c2VDbGljay5iaW5kKHRoaXMpKTtcbiAgICBzZWxmLm1SZXN1bWVCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBzZWxmLm9uUmVzdW1lQ2xpY2suYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0LXJlc2V0QmxvY2tcIik7XG4gICAgU3RhZ2VDcmVhdG9yLmluaXQodGhpcy5ub2RlLCBzZWxmLm1Hcm91bmQsIHNlbGYubU1vbnN0ZXJCbG9ja1ByZWZzKTtcbiAgICBTdGFnZUNyZWF0b3IuY3JlYXRlKHRoaXMubUN1cnJlbnRTdGFnZSk7XG4gICAgc2VsZi5yZXNldEJsb2NrKCk7XG4gICAgc2VsZi5tUGF1c2VWaWV3LmFjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMubVRyeVRpbWVzTGFiZWwuc3RyaW5nID0gdGhpcy5tVHJ5VGltZXM7XG4gIH0sXG4gIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgaWYgKHRoaXMubUJsb2NrLnggPiB0aGlzLkVORF9QT1NJVElPTikge1xuICAgICAgdGhpcy5tQmxvY2sueCA9IHRoaXMubUJsb2NrQ29tcC5ERUZBVUxUX1BPU0lUSU9OX1g7XG4gICAgICB0aGlzLmFkZFN0YWdlKCk7XG4gICAgICB0aGlzLmFkZExpZmUoKTtcbiAgICAgIFN0YWdlQ3JlYXRvci5jbGVhclN0YWdlKCk7XG4gICAgICBTdGFnZUNyZWF0b3IuY3JlYXRlKHRoaXMubUN1cnJlbnRTdGFnZSk7XG4gICAgfVxuICB9LFxuXG4gIGluaXRNb25zdGVyczogZnVuY3Rpb24gaW5pdE1vbnN0ZXJzKCkge30sXG5cbiAgZ2V0R3JvdW5kWTogZnVuY3Rpb24gZ2V0R3JvdW5kWShub2RlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vU3RhZ2VDcmVhdG9yLmluaXQodGhpcy5ub2RlLCBzZWxmLm1Hcm91bmQsIHNlbGYubU1vbnN0ZXJCbG9ja1ByZWZzKTtcbiAgICByZXR1cm4gU3RhZ2VDcmVhdG9yLmdldEdyb3VuZFkobm9kZSk7XG4gIH0sXG5cbiAgcmVzZXRCbG9jazogZnVuY3Rpb24gcmVzZXRCbG9jaygpIHtcbiAgICBjb25zb2xlLmxvZyhcIkdhbWUgIHJlc2V0QmxvY2sgdHJ5OlwiICsgdGhpcy5tVHJ5VGltZXMpO1xuICAgIHZhciBibG9ja0NvbXAgPSB0aGlzLm1CbG9ja0NvbXA7XG4gICAgaWYgKCEhYmxvY2tDb21wKSB7XG4gICAgICBibG9ja0NvbXAubUdhbWUgPSB0aGlzO1xuICAgICAgYmxvY2tDb21wLnJlc2V0U2VsZigpO1xuICAgIH1cbiAgfSxcblxuICBsb3NzTGlmZTogZnVuY3Rpb24gbG9zc0xpZmUoKSB7XG4gICAgY29uc29sZS5sb2coXCJsb3NzTGlmZSBcIiArIHRoaXMubVRyeVRpbWVzKTtcbiAgICB0aGlzLm1UcnlUaW1lcy0tO1xuICAgIGlmICh0aGlzLm1UcnlUaW1lcyA8PSAwKSB7XG4gICAgICAvL1lvdSBMb3NzXG4gICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubVRyeVRpbWVzTGFiZWwuc3RyaW5nID0gdGhpcy5tVHJ5VGltZXM7XG4gICAgfVxuICB9LFxuXG4gIGFkZExpZmU6IGZ1bmN0aW9uIGFkZExpZmUoKSB7XG4gICAgdGhpcy5tVHJ5VGltZXMrKztcbiAgICB0aGlzLm1UcnlUaW1lc0xhYmVsLnN0cmluZyA9IHRoaXMubVRyeVRpbWVzO1xuICB9LFxuXG4gIGFkZFN0YWdlOiBmdW5jdGlvbiBhZGRTdGFnZSgpIHtcbiAgICB0aGlzLm1DdXJyZW50U3RhZ2UrKztcbiAgICB0aGlzLm1TdGFnZVZhbHVlTm9kZS5zdHJpbmcgPSB0aGlzLm1DdXJyZW50U3RhZ2U7XG4gIH0sXG4gIGdhbWVPdmVyOiBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5tQmxvY2suc3RvcEFsbEFjdGlvbnMoKTsgLy/lgZzmraIgcGxheWVyIOiKgueCueeahOi3s+i3g+WKqOS9nFxuICAgIEdsb2JhbC5nYW1lT3ZlckFyZy5zY29yZSA9IHRoaXMubVNjb3JlO1xuICAgIEdsb2JhbC5nYW1lT3ZlckFyZy5zdGFnZSA9IHRoaXMubUN1cnJlbnRTdGFnZTtcbiAgICBHbG9iYWwuZ2FtZU92ZXJBcmcudHJ5dGltZXMgPSB0aGlzLm1UcnlUaW1lcztcbiAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ0dhbWVPdmVyJyk7XG4gIH0sXG4gIG9uUGF1c2VDbGljazogZnVuY3Rpb24gb25QYXVzZUNsaWNrKCkge1xuICAgIGlmICh0aGlzLm1Jc1BhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm1Jc1BhdXNlZCA9IHRydWU7XG4gICAgLy90aGlzLm1CbG9jay5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLm1QYXVzZVZpZXcuYWN0aXZlID0gdHJ1ZTtcbiAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMubUF1ZGlvUGF1c2UsIGZhbHNlKTtcbiAgICB0aGlzLm1BdWRpb1BsYXllci5wYXVzZSgpO1xuICAgIHRoaXMubm9kZS5lbmFibGUgPSBmYWxzZTtcbiAgICBMb2cuZChcInBhdXNlIGRpcmVjdG9yXCIpO1xuICAgIGNjLmRpcmVjdG9yLnBhdXNlKCk7XG4gIH0sXG4gIG9uUmVzdW1lQ2xpY2s6IGZ1bmN0aW9uIG9uUmVzdW1lQ2xpY2soKSB7XG4gICAgaWYgKCF0aGlzLm1Jc1BhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm1QYXVzZVZpZXcuYWN0aXZlID0gZmFsc2U7XG4gICAgY2MuZGlyZWN0b3IucmVzdW1lKCk7XG4gICAgdGhpcy5tQXVkaW9QbGF5ZXIucmVzdW1lKCk7XG4gICAgdGhpcy5tSXNQYXVzZWQgPSBmYWxzZTtcbiAgfSxcbiAgLy/lvIPnlKhcbiAgc3RhcnRSZXN1bWVDb3VudERvd246IGZ1bmN0aW9uIHN0YXJ0UmVzdW1lQ291bnREb3duKCkge1xuICAgIExvZy5kKFwiU3RhcnQgQ291bnREb3duXCIpO1xuICAgIGNjLmRpcmVjdG9yLmdldFNjaGVkdWxlcigpLnNjaGVkdWxlKHRoaXMucmVzdW1lQ291bnREb3duQ2FsbGJhY2ssIHRoaXMsIDMsIDEsIDEsIHRydWUpO1xuICB9LFxuICAvL+W8g+eUqFxuICByZXN1bWVDb3VudERvd25DYWxsYmFjazogZnVuY3Rpb24gcmVzdW1lQ291bnREb3duQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5ub2RlLmVuYWJsZSA9IHRydWU7XG4gICAgTG9nLmQoXCJyZXN1bWUgZGlyZWN0b3JcIik7XG4gICAgY2MuZGlyZWN0b3IucmVzdW1lKCk7XG4gICAgdGhpcy5tQXVkaW9QbGF5ZXIucmVzdW1lKCk7XG4gICAgdGhpcy5tSXNQYXVzZWQgPSBmYWxzZTtcbiAgfVxuXG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzlhZDE0b21YbFZOUTRKem56R2hSUmp3JywgJ0dsb2JhbCcpO1xuLy8gU2NyaXB0L0dsb2JhbC5qc1xuXG4vL+WFqOWxgOWPmOmHjyznlKjmnaXkvKDpgJLlj4LmlbBcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vR2FtZU92ZXIgU2NlbmUgQXJndW1lbnRzXG4gIGdhbWVPdmVyQXJnOiB7XG4gICAgc2NvcmU6IDAsXG4gICAgdHJ5dGltZXM6IDBcbiAgfVxufTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzFmYzllWTg3bnhIWDRKdU9zb2xEVHRnJywgJ0hlbHBlcnMnKTtcbi8vIFNjcmlwdC9IZWxwZXJzLmpzXG5cbnZhciBIZWxwZXJzID0ge1xuICAgIGdldFJhbmRvbUludDogZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1heCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoY2MucmFuZG9tMFRvMSgpICogbWF4KTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlbHBlcnM7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdiOTkwNzI3NDY5SUVvLzhxVXFKeWdQWicsICdMb2cnKTtcbi8vIFNjcmlwdC9Mb2cuanNcblxuLyoqXG4gKiBDcmVhdGVkIGJ5IGZ1cWlhbmcgb24gMjAxNi8xMC8yMy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVidWc6IHRydWUsXG4gIHNldERlYnVnOiBmdW5jdGlvbiBzZXREZWJ1Zyhpc0RlYnVnKSB7XG4gICAgdGhpcy5kZWJ1ZyA9IGlzRGVidWc7XG4gIH0sXG5cbiAgZDogZnVuY3Rpb24gZCgpIHtcbiAgICBpZiAoIXRoaXMuZGVidWcpIHJldHVybjtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBjb25zb2xlLmxvZyhhcmd1bWVudHNbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbXNnID0gXCJcIjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1zZyA9IG1zZyArIEpTT04uc3RyaW5naWZ5KGFyZ3VtZW50c1tpXSkgKyBcIiBcIjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgfVxuICB9XG59O1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNTZhNGNyR2JhdEVKcGVoVzdoWk91TUQnLCAnTW9uc3RlcicpO1xuLy8gU2NyaXB0L01vbnN0ZXIuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICBjYy5kaXJlY3Rvci5nZXRDb2xsaXNpb25NYW5hZ2VyKCkuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkRGVidWdEcmF3ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50b3VjaGluZ051bWJlciA9IDA7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHt9LFxuICAgIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRW50ZXIob3RoZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvbkNvbGxpc2lvbkVudGVyIFwiKTtcbiAgICAgICAgdGhpcy5ub2RlLmNvbG9yID0gY2MuQ29sb3IuUkVEO1xuICAgICAgICB0aGlzLnRvdWNoaW5nTnVtYmVyKys7XG4gICAgfSxcblxuICAgIG9uQ29sbGlzaW9uU3RheTogZnVuY3Rpb24gb25Db2xsaXNpb25TdGF5KG90aGVyKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdvbiBjb2xsaXNpb24gc3RheScpO1xuICAgIH0sXG5cbiAgICBvbkNvbGxpc2lvbkV4aXQ6IGZ1bmN0aW9uIG9uQ29sbGlzaW9uRXhpdCgpIHtcbiAgICAgICAgdGhpcy50b3VjaGluZ051bWJlci0tO1xuICAgICAgICBpZiAodGhpcy50b3VjaGluZ051bWJlciA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLmNvbG9yID0gY2MuQ29sb3IuV0hJVEU7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzZjMWVkSWVPazFIYjZJVXU1UjhwaFRKJywgJ1BlcnNpc3ROb2RlJyk7XG4vLyBTY3JpcHQvUGVyc2lzdE5vZGUuanNcblxuY2MuQ2xhc3Moe1xuICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gIHByb3BlcnRpZXM6IHtcbiAgICAvLyBmb286IHtcbiAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAvLyB9LFxuICAgIC8vIC4uLlxuICB9LFxuXG4gIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHt9LFxuXG4gIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgLy8gfSxcblxuICBzZXRHYW1lT3ZlckFyZzogZnVuY3Rpb24gc2V0R2FtZU92ZXJBcmcoYXJnKSB7XG4gICAgdGhpcy5nYW1lT3ZlckFyZyA9IGFyZztcbiAgfSxcbiAgZ2V0R2FtZU92ZXJBcmc6IGZ1bmN0aW9uIGdldEdhbWVPdmVyQXJnKCkge1xuICAgIHZhciBhID0gdGhpcy5nYW1lT3ZlckFyZztcbiAgICB0aGlzLmdhbWVPdmVyQXJnID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBhO1xuICB9XG5cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnZjgzMDFDN1NycFAzcWhNVlFEeGlpVU4nLCAnU3RhZ2VDcmVhdG9yJyk7XG4vLyBTY3JpcHQvU3RhZ2VDcmVhdG9yLmpzXG5cbi8qKlxuICpcbiAqIFRPRE86XG4gKiDmr4/kuKrpmpznoo3nianorr7nva7kuIDkuKrpmr7luqblgLws5q+P5Liq5YWz5Y2h5pyJ5LiA5Liq6Zq+5bqm5YC8LOmaj+acuueUn+aIkOmanOeijeeJqeadpee7hOaIkOS4gOS4quWFs+WNoVxuICpcbiAqIFRPRE86IOa4uOaIj+iKguWlj+WPmOWMllxuICog6ZqP552A5YWz5Y2h5aKe5Yqg6Zq+5bqm6KaB5Yqg5aSnXG4gKiAg5q+U5aaCOiAxLOmAn+W6puWinuWKoCzmlrnlnZfot53nprvliqDlpKdcbiAqICAgICAgICAyLCDmlrnlnZfot53nprvlh4/lsI9cbiAqICAgICAgICAgMywg5aKe5Yqg57uE5ZCI6Zqc56KN54mpXG4gKlxuICog5YWz5Y2h55Sf5oiQ5ZmoXG4gKiBDcmVhdGVkIGJ5IGZ1cWlhbmcgb24gMjAxNi8xMC8xNy5cbiAqL1xudmFyIEhlbHBlcnMgPSByZXF1aXJlKCdIZWxwZXJzJyk7XG52YXIgaW5zdGFuY2UgPSB1bmRlZmluZWQ7XG52YXIgbUdhbWVOb2RlLCBtR3JvdW5kTm9kZSwgbU1vbnN0ZXJQcmVmYWJzO1xudmFyIG1Hcm91bmRZID0gMDtcblxudmFyIE1PTlNURVJfVEFHID0gMHgxMDAwO1xuXG52YXIgbU1vbnN0ZXJzID0gW107XG5cbi8qKlxuICog5Yib5bu65YWz5Y2hXG4gKiBAcGFyYW0gc3RhZ2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlKHN0YWdlKSB7XG4gIGNvbnNvbGUubG9nKFwiY3JlYXRlU3RhZ2UgXCIgKyBzdGFnZSk7XG5cbiAgLy9kZWZhdWx0XG4gIHZhciB4ID0gNTA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhZ2U7IGkrKykge1xuICAgIHggPSA1MCArIGNjLnJhbmRvbU1pbnVzMVRvMSgpICogNDUwO1xuICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZVJhbmRvbU1vbnN0ZXIoeCkpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnTGVmdChyYW5kb20pIHtcbiAgcmFuZG9tID0gcmFuZG9tIHx8IDA7XG4gIHJldHVybiAtMTcwICsgSGVscGVycy5nZXRSYW5kb21JbnQocmFuZG9tKTtcbn1cbmZ1bmN0aW9uIGdNaWRkbGUocmFuZG9tKSB7XG4gIHJhbmRvbSA9IHJhbmRvbSB8fCAwO1xuICByZXR1cm4gNzAgKyBIZWxwZXJzLmdldFJhbmRvbUludChyYW5kb20pO1xufVxuZnVuY3Rpb24gZ1JpZ2h0KHJhbmRvbSkge1xuICByYW5kb20gPSByYW5kb20gfHwgMDtcbiAgcmV0dXJuIDMwMCArIEhlbHBlcnMuZ2V0UmFuZG9tSW50KHJhbmRvbSk7XG59XG5cbi8qKlxuICog5Yib5bu65rWL6K+VU3RhZ2VcbiAqXG4gKiBAcGFyYW0gc3RhZ2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGVzdFN0YWdlKHN0YWdlKSB7XG4gIHZhciB4ID0gNTA7XG4gIHZhciBtaW5YID0gLTIwMDtcbiAgdmFyIG1pblNwbGl0ID0gMTcwICsgSGVscGVycy5nZXRSYW5kb21JbnQoNTApO1xuICB2YXIgcG9zWCA9IG1pblg7XG5cbiAgdmFyIGRpc3RlbmNlTHYxID0gMjIwO1xuICB2YXIgZGlzdGVuY2VMdjIgPSAyMDA7XG4gIHZhciBkaXN0ZW5jZUx2MyA9IDE5MDtcbiAgdmFyIGRpc3RlbmNlTHZNYXggPSAxNzA7XG5cbiAgc3dpdGNoIChzdGFnZSkge1xuICAgIGNhc2UgMTpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBwb3NYID0gZ01pZGRsZSgtMjApKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1sxXSwgcG9zWCA9IGdNaWRkbGUoMTApKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1syXSwgcG9zWCA9IGdNaWRkbGUoMTApKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgcG9zWCA9IGdMZWZ0KDIwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMl0sIHBvc1ggPSBnUmlnaHQoKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA1OlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMV0sIHBvc1ggPSBnTGVmdCgyMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzJdLCBwb3NYID0gZ1JpZ2h0KCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNjpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBwb3NYID0gZ0xlZnQoMjApKSk7XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1sxXSwgcG9zWCA9IGdSaWdodCg0MCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vdGVzdCBmb3IgZGlzdGVuY2VcbiAgICBjYXNlIDc6XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1swXSwgcG9zWCA9IGdMZWZ0KDUwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMl0sIHBvc1ggPSBnTWlkZGxlKDMwKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA4OlxuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMV0sIHBvc1ggPSBnTGVmdCgyMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBwb3NYID0gZ01pZGRsZSgyMCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgOTpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzJdLCBwb3NYID0gZ01pZGRsZSgzMCkpKTtcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzFdLCBwb3NYID0gZ1JpZ2h0KDUwKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxMDpcbiAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzWzBdLCBnTGVmdCgtMjApKSk7XG4gICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVNb25zdGVyKG1Nb25zdGVyUHJlZmFic1sxXSwgZ01pZGRsZSgwKSkpO1xuICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlTW9uc3RlcihtTW9uc3RlclByZWZhYnNbMl0sIGdSaWdodCgyMCkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoc3RhZ2UgPCAyMCkge1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdMZWZ0KC0xMCksIDMpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTWlkZGxlKDIwKSkpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdSaWdodCg4MCksIDMpKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhZ2UgPCAzMCkge1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdMZWZ0KC0xMCksIDMpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTWlkZGxlKDcwKSkpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdSaWdodCg1MCksIDMpKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhZ2UgPCA0MCkge1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdMZWZ0KDIwKSwgMykpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdNaWRkbGUoMTApKSk7XG4gICAgICAgIG1Nb25zdGVycy5wdXNoKGNyZWF0ZVJhbmRvbU1vbnN0ZXIoZ1JpZ2h0KDgwKSwgMykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTGVmdCg0MCksIDMpKTtcbiAgICAgICAgbU1vbnN0ZXJzLnB1c2goY3JlYXRlUmFuZG9tTW9uc3RlcihnTWlkZGxlKDM1KSkpO1xuICAgICAgICBtTW9uc3RlcnMucHVzaChjcmVhdGVSYW5kb21Nb25zdGVyKGdSaWdodCgxMCksIDMpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKlxuICog5Yib5bu66ZqP5py65pWM5Lq6XG4gKiBAcGFyYW0geCAgICAgICDkvY3nva5cbiAqIEBwYXJhbSBub0luZGV4IOmZpG5vSW5kZXjkuYvlpJZcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBjcmVhdGVSYW5kb21Nb25zdGVyKHgsIG5vSW5kZXgpIHtcbiAgdmFyIGluZGV4ID0gSGVscGVycy5nZXRSYW5kb21JbnQobU1vbnN0ZXJQcmVmYWJzLmxlbmd0aCk7XG4gIHdoaWxlIChub0luZGV4ID09IGluZGV4KSB7XG4gICAgaW5kZXggPSBIZWxwZXJzLmdldFJhbmRvbUludChtTW9uc3RlclByZWZhYnMubGVuZ3RoKTtcbiAgfVxuICBjb25zb2xlLmxvZyhcImluZGV4IDpcIiArIGluZGV4KTtcbiAgcmV0dXJuIGNyZWF0ZU1vbnN0ZXIobU1vbnN0ZXJQcmVmYWJzW2luZGV4XSwgeCk7XG59XG5cbi8qKlxuICog5Yib5bu6TW9uc3RlclxuICogQHBhcmFtIG1vbnN0ZXJQcmVmYWJcbiAqL1xuZnVuY3Rpb24gY3JlYXRlTW9uc3RlcihwcmVmYWIsIHgpIHtcbiAgY2MubG9nKFwiY3JlYXRlTW9uc3RlciBcIiArIHgpO1xuICB2YXIgbW9uc3RlciA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XG4gIG1HYW1lTm9kZS5hZGRDaGlsZChtb25zdGVyKTtcbiAgdmFyIHkgPSBnZXRHcm91bmRZKG1vbnN0ZXIpO1xuICBtb25zdGVyLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpO1xuICBtb25zdGVyLnRhZyA9IE1PTlNURVJfVEFHO1xuICBjb25zb2xlLmxvZyhcIm1vbnN0ZXI6XCIgKyBtb25zdGVyLnggKyBcIiAgICBcIiArIG1vbnN0ZXIueSk7XG4gIHJldHVybiBtb25zdGVyO1xufVxuXG5mdW5jdGlvbiBjbGVhclN0YWdlKCkge1xuICBjb25zb2xlLmxvZyhcImNsZWFyU3RhZ2UgcmVtb3ZlIG1vbnN0ZXIgY291bnQ6XCIgKyBtTW9uc3RlcnMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtTW9uc3RlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBtR2FtZU5vZGUucmVtb3ZlQ2hpbGQobU1vbnN0ZXJzW2ldKTtcbiAgfVxuICBtTW9uc3RlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiDojrflj5blnLDpnaLpq5jluqZcbiAqIEBwYXJhbSBtb25zdGVyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRHcm91bmRZKG1vbnN0ZXIpIHtcbiAgY29uc29sZS5sb2cobW9uc3RlciArIFwiIFwiICsgbUdyb3VuZE5vZGUgKyBcIiAgXCIgKyBtR2FtZU5vZGUpO1xuICBjb25zb2xlLmxvZyhtR3JvdW5kTm9kZS5oZWlnaHQgKyAnKyAgJyArIG1vbnN0ZXIuaGVpZ2h0ICsgXCIvMi0gXCIgKyBtR2FtZU5vZGUuaGVpZ2h0ICsgXCIvMlwiKTtcbiAgcmV0dXJuIG1Hcm91bmROb2RlLnkgKyBtR3JvdW5kTm9kZS5oZWlnaHQgLyAyICsgbW9uc3Rlci5oZWlnaHQgLyAyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uIGluaXQoYUdhbWVOb2RlLCBhR3JvdW5kTm9kZSwgYU1vbnN0ZXJQcmVmYWJzKSB7XG4gICAgbUdhbWVOb2RlID0gYUdhbWVOb2RlO1xuICAgIG1Hcm91bmROb2RlID0gYUdyb3VuZE5vZGU7XG4gICAgbU1vbnN0ZXJQcmVmYWJzID0gYU1vbnN0ZXJQcmVmYWJzO1xuICB9LFxuICAvL3Rlc3RcbiAgY3JlYXRlOiBjcmVhdGVUZXN0U3RhZ2UsIC8vY3JlYXRlXG4gIC8vY3JlYXRlOiBjcmVhdGUsXG4gIGNsZWFyU3RhZ2U6IGNsZWFyU3RhZ2UsXG4gIGdldEdyb3VuZFk6IGdldEdyb3VuZFlcbn07XG5cbmNjLl9SRnBvcCgpOyJdfQ==
