import { SpriteDrawable } from "./SpriteDrawable.js";

export class AnimatedSpriteDrawable extends SpriteDrawable {
    constructor(params) {
        super(params);
        this._fixed = false;
        this._animPlaying = false;
    }
    isAnimPlaying(animName) {
        return this._anim && animName == this._anim.name;
    }
    playAnim(anim, loop) {
        this._anim = anim;
        this._animPlaying = true;
        this._animCounter = 0;
        this._animCurFrame = 0;
        this._animLoop = loop;
        this._animFirst = true;
    }
    resumeAnim() {
        this._animPlaying = true;
    }
    pauseAnim() {
        this._animPlaying = false;
    }
    update(dt) {
        this._updateAnim(dt);
        this._updateRenderObject();
    }
    _updateAnim(dt) {
        if(!this._animPlaying) {
            return;
        }
        if (this._animFirst || this._animCounter >= this._anim.frames[this._animCurFrame].duration) {
            this._animFirst = false;
            this._animCounter = 0;
            if (++this._animCurFrame >= this._anim.frames.length) {
                if(this._animLoop) {
                    this._animCurFrame = 0;
                }
                else {
                    this._animPlaying = false;
                    this.broadcast({ topic: "animEnd", animName: this._anim.name });
                    return;
                }
            }
            let frame = this._anim.frames[this._animCurFrame];
            this._sprite.setRegion(
                this._anim.margin + frame.x * (this._anim.frameWidth + this._anim.spacing),
                this._anim.margin + frame.y * (this._anim.frameHeight + this._anim.spacing),
                this._anim.frameWidth,
                this._anim.frameHeight
            );
        }
        this._animCounter += dt;
    }
}