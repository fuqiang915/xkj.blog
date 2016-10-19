require=function e(t,o,n){function c(r,s){if(!o[r]){if(!t[r]){var a="function"==typeof require&&require;if(!s&&a)return a(r,!0);if(i)return i(r,!0);var l=new Error("Cannot find module '"+r+"'");throw l.code="MODULE_NOT_FOUND",l}var u=o[r]={exports:{}};t[r][0].call(u.exports,function(e){var o=t[r][1][e];return c(o?o:e)},u,u.exports,e,t,o,n)}return o[r].exports}for(var i="function"==typeof require&&require,r=0;r<n.length;r++)c(n[r]);return c}({Block:[function(e,t,o){"use strict";cc._RFpush(t,"656bdDb+lFIFoaXN1OhBa/K","Block"),cc.Class({"extends":cc.Component,properties:function(){return{mSpeed:0,mJumpHeight:0,mJumpDuration:0}},onLoad:function(){var e=this;e.node.scaleX=-1,e.jumpAction=e.createJumpAction(),e.isJumping=!1,cc.director.getCollisionManager().enabled=!0,cc.director.getCollisionManager().enabledDebugDraw=!0,this.touchingNumber=0,cc.eventManager.addListener({event:cc.EventListener.KEYBOARD,onKeyPressed:function(t,o){switch(t){case cc.KEY.space:if(e.isJumping)break;e.isJumping=!0,e.jump()}}},e.node)},update:function(e){this.node.x>500&&(this.node.x=-400);var t=this.mSpeed*e;this.node.x+=t},createJumpAction:function(){console.log("jump");var e=this;this.moveUpAction=cc.moveBy(this.mJumpDuration,cc.p(0,this.mJumpHeight)).easing(cc.easeCubicActionOut()),this.rotate180Action=cc.rotateBy(this.mJumpDuration,90),this.moveDownAction=cc.moveBy(this.mJumpDuration,cc.p(0,-this.mJumpHeight)).easing(cc.easeCubicActionIn()),this.upAndRotate=cc.spawn(this.moveUpAction,this.rotate180Action),this.downAndRotate=cc.spawn(this.moveDownAction,this.rotate180Action);var t=cc.callFunc(function(t,o){e.isJumping=!1},this,100);return cc.sequence(this.upAndRotate,this.downAndRotate,t)},jump:function(){this.node.runAction(this.jumpAction)},resetSelf:function(){console.log("xkj block block"),this.node.active=!1,this.node.stopAllActions(),this.node.x=-400,this.node.y=this.mGame.getGroundY(this.node),this.node.setRotation(0),this.isJumping=!1,this.node.active=!0,this.mGame.addTryTimes()},onCollisionEnter:function(e){console.log("onCollisionEnter "),this.node.color=cc.Color.RED,this.touchingNumber++,this.resetSelf()},onCollisionStay:function(e){this.resetSelf()},onCollisionExit:function(){this.touchingNumber--,0===this.touchingNumber&&(this.node.color=cc.Color.WHITE)}}),cc._RFpop()},{}],Db:[function(e,t,o){"use strict";cc._RFpush(t,"a4e82GKkZhJTrasK1utNGpI","Db");var n={put:function(e,t){console.log("put :"+e+"  "+t),cc.sys.localStorage.setItem(e,t)},get:function(e){return console.log("get:"+e),cc.sys.localStorage.getItem(e)}};t.exports=n,cc._RFpop()},{}],GameOver:[function(e,t,o){"use strict";cc._RFpush(t,"df3fbk75QRGsI5Kq1gNj341","GameOver");var n=e("Global"),c=e("Db"),i="Key_of_data";cc.Class({"extends":cc.Component,properties:{mTitle:{"default":null,type:cc.Label},mScore:{"default":null,type:cc.Label},mTryTimes:{"default":null,type:cc.Label},mRestartBtn:{"default":null,type:cc.Node}},onLoad:function(){console.log("onLoad GameOver "+n.gameOverArg.trytimes),this.mScore.string="Score: "+n.gameOverArg.score;var e="TryTimes: "+n.gameOverArg.trytimes;this.saveToLocal(n.gameOverArg.score,n.gameOverArg.trytimes);var t=this.readLocalData();e+="\n\n LastTime:\n Score:"+t.score+" \nTryTimes: "+t.trytimes,this.mTryTimes.string=e,this.mRestartBtn.on(cc.Node.EventType.TOUCH_END,this.onRestartClick.bind(this))},update:function(e){},onRestartClick:function(){cc.director.loadScene("GameMain")},saveToLocal:function(e,t){var o={score:e,trytimes:t};c.put(i,JSON.stringify(o))},readLocalData:function(){var e=JSON.parse(c.get(i));return console.log("localData "+JSON.stringify(e)),e=e?e:{score:0,trytimes:0}}}),cc._RFpop()},{Db:"Db",Global:"Global"}],Game:[function(e,t,o){"use strict";cc._RFpush(t,"2a6d9iKgFNDBI2zZ94PpVQW","Game");var n=e("Helpers"),c=e("Global");cc.Class({"extends":cc.Component,properties:{mBlock:{"default":null,type:cc.Node},mGround:{"default":null,type:cc.Node},mMonsterBlockPrefs:{"default":[],type:cc.Prefab},randomRange:{"default":null,x:500,y:200},mScoreLabel:{"default":null,type:cc.Label},mTryTimesLabel:{"default":null,type:cc.Label},mScore:0,mTryTimes:{"default":0,type:cc.Integer},mMiddleNode:{"default":null,type:cc.Node}},onLoad:function(){self=this,self.createRamdomMonster(),self.resetBlock()},update:function(e){},initMonsters:function(){},createRamdomMonster:function(){var e=this,t=n.getRandomInt(e.mMonsterBlockPrefs.length);console.log("index :"+t),e.createMonster(e.mMonsterBlockPrefs[t])},resetBlock:function(){console.log("Game  resetBlock try:"+this.mTryTimes);var e=this.mBlock.getComponent("Block");e.mGame=this,e.resetSelf()},createMonster:function(e){var t=cc.instantiate(e);this.node.addChild(t);var o=50+450*cc.randomMinus1To1(),n=this.getGroundY(t);t.setPosition(cc.p(o,n)),console.log("monster:"+t.x+"    "+t.y)},getRandomPosition:function(){return cc.p(50+450*cc.randomMinus1To1(),-72)},getGroundY:function(e){return this.mGround.height+e.height/2-this.node.height/2},addTryTimes:function(){console.log("addTryTimes "+this.mTryTimes),this.mTryTimes>=10?this.gameOver():(this.mTryTimesLabel.string=this.mTryTimes,this.mTryTimes++)},gameOver:function(){this.mBlock.stopAllActions(),c.gameOverArg.score=this.mScore,c.gameOverArg.trytimes=this.mTryTimes,cc.director.loadScene("GameOver")}}),cc._RFpop()},{Global:"Global",Helpers:"Helpers"}],Global:[function(e,t,o){"use strict";cc._RFpush(t,"9ad14omXlVNQ4JznzGhRRjw","Global"),t.exports={gameOverArg:{score:0,trytimes:0}},cc._RFpop()},{}],Helpers:[function(e,t,o){"use strict";cc._RFpush(t,"1fc9eY87nxHX4JuOsolDTtg","Helpers");var n={getRandomInt:function(e){return parseInt(cc.random0To1()*e)}};t.exports=n,cc._RFpop()},{}],Monster:[function(e,t,o){"use strict";cc._RFpush(t,"56a4crGbatEJpehW7hZOuMD","Monster"),cc.Class({"extends":cc.Component,properties:{},onLoad:function(){cc.director.getCollisionManager().enabled=!0,cc.director.getCollisionManager().enabledDebugDraw=!0,this.touchingNumber=0},update:function(e){},onCollisionEnter:function(e){console.log("onCollisionEnter "),this.node.color=cc.Color.RED,this.touchingNumber++},onCollisionStay:function(e){},onCollisionExit:function(){this.touchingNumber--,0===this.touchingNumber&&(this.node.color=cc.Color.WHITE)}}),cc._RFpop()},{}],PersistNode:[function(e,t,o){"use strict";cc._RFpush(t,"6c1edIeOk1Hb6IUu5R8phTJ","PersistNode"),cc.Class({"extends":cc.Component,properties:{},onLoad:function(){},setGameOverArg:function(e){this.gameOverArg=e},getGameOverArg:function(){var e=this.gameOverArg;return this.gameOverArg=void 0,e}}),cc._RFpop()},{}]},{},["Helpers","Game","Monster","Block","PersistNode","Global","Db","GameOver"]);