<template>
  <div class="stories-wrapper">
    <div @click="closeStories" class="close"></div>
    <div class="stories">
      <div
          v-for="(story, index) in stories"
          :key="index"
          class="story"
          :style="
          index === indexSelected
            ? `transform: translate(0px)`
            : `transform: translate(${calculateTransform(index)}px) scale(0.3);cursor:pointer;`
        "
          @click="index !== indexSelected ? selectSlide(index) : ''"
      >
        <div class="story__source" @click="isPaused ? playStory($event) : pauseStory($event)">
          <video :id="getSrc(story, index).url" v-if="getSrc(story, index).type === 'video'"
                 @play="handleVideoLoaded"
                 :src="getSrc(story, index).url" autoplay></video>
          <img
              v-else
              :src="getSrc(story, index).url"
              alt=""
          />
          <div class="story__header" v-if="index === indexSelected">
            <div class="time">
              <div
                  class="time__item"
                  v-for="(elm, index) in story.images.length"
                  :key="index"
              >
                <div
                    class="time__fill"
                    :style="
                    index === key
                      ? `width: ${percent}%`
                      : key > index
                      ? `width:100%`
                      : `width:0%`
                  "
                ></div>
              </div>
            </div>
            <div class="story__top">
              <div class="user">
                <div class="user__image">
                  <img :src="story.picture" alt=""/>
                </div>
                <div class="user__name">
                  {{ story.username }}
                </div>
              </div>
              <div class="story__time">{{ story.time }}</div>
            </div>
          </div>
          <div class="story__body">
            <div class="user" v-if="index !== indexSelected">
              <div class="user__image" :style="getNotViewedIndex(story) === -1 ? `background: #FFFFFF` : ''">
                <img :src="story.picture" alt=""/>
              </div>
              <div class="user__name">
                {{ story.username }}
              </div>
            </div>
            <slot v-if="showInnerContent && index === indexSelected" name="innerContent" :story="story"></slot>
          </div>
        </div>
        <div v-if="index === indexSelected" class="story__icon story__icon--prev" @click="prev(index)"></div>
        <div v-if="index === indexSelected" class="story__icon story__icon--next" @click="next(index)"></div>
        <slot v-if="showOuterContent && index === indexSelected" name="outerContent" :story="story"></slot>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Stories',
  props: {
    stories: {
      type: Array,
      required: true,
    },
    duration: {
      type: Number,
      default: 3000,
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
    showInnerContent: {
      type: Boolean,
      default: false,
    },
    showOuterContent: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    indexSelected: 0,
    difference: 0,
    key: 0,
    percent: 0,
    timer: 0,
    progress: 0,
    interval: 0,
    isPaused: false,
    newDur: 0,
    pausePer: 0,
    currentVideoDuration: null,
  }),
  computed: {
    isAllStoriesEnd() {
      return this.indexSelected >= this.stories.length - 1 && this.isCurrentAllImagesEnd;
    },
    isCurrentAllImagesEnd() {
      return this.key >= this.stories[this.indexSelected].images.length - 1;
    },
    realDuration(){
      return this.currentVideoDuration !== null ? this.currentVideoDuration : this.duration;
    }
  },
  methods: {
    getSrc(story, index) {
      const viewedIndex = this.getLastViewedIndex(story);
      return index === this.indexSelected
          ? {
            url: story.images[this.key].url,
            type: story.images[this.key].type,
          }
          : {
            url: story.images[viewedIndex].url,
            type: story.images[viewedIndex].type,
          }
    },
    getNotViewedIndex(story) {
      return story.images.findIndex(item => !item.viewed);
    },
    getLastViewedIndex(story) {
      const keyIndex = this.getNotViewedIndex(story);
      const index = story.images.length - 1;
      return keyIndex === -1 ? index : keyIndex;
    },
    selectSlide(index) {
      this.isPaused = false;
      this.difference += this.indexSelected - index;
      this.stopVideo(this.stories[this.indexSelected].images[this.key].url);
      this.indexSelected = index;
      this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);
      this.reset()
    },
    onAllStoriesEnd() {
      this.difference = 0;
      this.indexSelected = 0;
      this.key = 0;
      this.$emit('allStoriesEnd');
    },
    onCurrentAllImagesEnd(index) {
      this.difference += index - (index + 1);
      this.stopVideo(this.stories[this.indexSelected].images[this.key].url);
      this.stories[index].images[this.key].viewed = true;
      this.indexSelected++;
      this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);
      this.reset();
      this.$emit('сurrentAllImagesEnd', index);
    },
    onCurrentImageEnd(index) {
      this.stories[index].images[this.key].viewed = true;
      this.$emit('сurrentImageEnd', this.key);
      this.key++;
    },
    next(index) {
      this.isPaused = false;
      if (this.isAllStoriesEnd) {
        this.onAllStoriesEnd();
      } else if (this.isCurrentAllImagesEnd) {
        setTimeout(() => {
          this.onCurrentAllImagesEnd(index);
        })
      } else {
        this.stories[this.indexSelected].images[this.key].viewed = true;
        this.key++
      }
      this.reset()
    },
    prev(index) {
      this.isPaused = false;
      if (this.indexSelected <= 0 && this.key <= 0) {
        this.key = 0
      } else if (this.key <= 0) {
        // Without delay
        setTimeout(() => {
          this.difference += index - (index - 1);
          this.indexSelected--;
          this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);
          this.reset();
        })
      } else {
        this.key--;
        this.stories[this.indexSelected].images[this.key].viewed = false;
      }
      this.reset()
    },
    autoPlay() {
      if (this.isAllStoriesEnd) {
        this.onAllStoriesEnd();
      } else if (this.isCurrentAllImagesEnd) {
        this.onCurrentAllImagesEnd(this.indexSelected);
      } else {
        this.onCurrentImageEnd(this.indexSelected);
      }
      this.reset();

    },
    play() {
      this.timer = new Date().getTime();
      this.progress = setInterval(() => {
        // forward
        let time = new Date().getTime()
        if (this.newDur > 0) {
          this.percent =
              this.pausePer +
              Math.floor((100 * (time - this.timer)) / this.realDuration);
        } else {
          this.percent = Math.floor((100 * (time - this.timer)) / this.realDuration);
        }
      }, this.realDuration / 100)
      if (this.newDur > 0) {
        this.interval = setInterval(this.autoPlay, this.newDur)
      } else {
        this.interval = setInterval(this.autoPlay, this.realDuration);
      }
    },
    reset() {
      this.percent = 0;
      this.currentVideoDuration = null;
      clearInterval(this.interval);
      clearInterval(this.progress);
      this.newDur = 0;
      if(this.stories[this.indexSelected].images[this.key].type === 'video'){
        const video = document.getElementById(this.stories[this.indexSelected].images[this.key].url);
        if (video) {
          video.play();
        }
        // this.play() is called from video play callback
        return;
      }
      this.play();
    },
    handleVideoLoaded(){
      if(this.currentVideoDuration !== null){
        return;
      }
      const video = document.getElementById(this.stories[this.indexSelected].images[this.key].url);
      if (video) {
        this.currentVideoDuration = video.duration*1000;
      }else{
        return;
      }
      this.play();
    },
    pauseStory(event) {
      if (event) {
        this.toggleVideo('pause', event);
      }
      this.isPaused = true;
      this.pausePer = this.percent;
      clearInterval(this.progress);
      clearInterval(this.interval);
      this.newDur = this.realDuration - (this.pausePer * this.realDuration) / 100;
    },
    playStory(event) {
      if (event) {
        this.toggleVideo('play', event);
      }
      this.isPaused = false;
      this.play();
    },
    toggleVideo(type, event) {
      const video = document.getElementById(event.target.id);
      if (video) {
        video[type]();
      }
    },
    stopVideo(id) {
      this.currentVideoDuration = null;
      const video = document.getElementById(id);
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    },
    calculateTransform(index) {
      if (this.indexSelected - index === -1 || this.indexSelected - index === 1) {
        return 315 * (index + this.difference);
      }
      if (index > this.indexSelected) {
        return (315 + 315 * (index + this.difference)) * 0.5;
      } else {
        return Math.abs((315 - 315 * (index + this.difference)) * 0.5) * -1;
      }
    },
    closeStories(){
      this.$emit('closeStories');
    },
  },
  mounted() {
    this.play();
    this.selectSlide(this.currentIndex);
  }
}

</script>

<style lang="scss" scoped>

* {
  box-sizing: border-box;
}

.stories-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(16, 16, 16, 0.98);
  font-family: sans-serif;
}

.stories {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.story {
  position: absolute;
  transition: transform .2s cubic-bezier(0.4, 0, 1, 1);

  @media screen and (max-width: 768px) {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__source {
    position: relative;
    border-radius: 16px;
    background: #000000;
    width: 414px;
    height: 751px;
    background-size: contain;

    @media screen and (max-width: 768px) {
      width: 100%;
      height: auto;
      flex: 1 1 auto;
    }

    img, video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  &__header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 8px 11px;
  }

  &__time {
    font-size: 16px;
    line-height: 20px;
    color: #FFFFFF;
  }

  &__top {
    display: flex;
    align-items: center;
  }

  &__body {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    .user {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);

      @media screen and (max-width: 768px) {
        display: none;
      }
    }

    .user__name {
      display: none;
    }

    .user__image {
      width: 140px;
      height: 140px;
      background: linear-gradient(180deg, #4C7CF6 0%, #6200C3 100%);
      margin: 0;
      padding: 5px;

      img {
        border: 5px solid #FFFFFF;
        border-radius: 100%;
      }
    }
  }

  &__icon {
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;

    @media screen and (max-width: 768px) {
      top: 0;
      bottom: 0;
      transform: none;
      width: 100px;
      height: auto;
      background: none;
    }

    &:before {
      content: "";
      position: absolute;
      top: 8px;
      left: 9px;
      border: solid #323232;
      border-width: 0 2px 2px 0;
      display: inline-block;
      padding: 3px;
      transform: rotate(135deg);
      border-radius: 1px;

      @media screen and (max-width: 768px) {
        content: none;
      }
    }

    &--prev {
      left: -35px;

      @media screen and (max-width: 768px) {
        left: 0;
      }
    }

    &--next {
      right: -35px;
      transform: translateY(-50%) rotate(180deg);

      @media screen and (max-width: 768px) {
        right: 0;
        transform: none;
      }
    }
  }
}

.user {
  display: flex;
  align-items: center;

  &__image {
    width: 32px;
    height: 32px;
    border-radius: 100px;
    overflow: hidden;
    margin-right: 8px;

    img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }
  }

  &__name {
    font-weight: 600;
    font-size: 16px;
    line-height: 18px;
    color: #FFFFFF;
    margin-right: 5px;
  }
}

.time {
  display: flex;
  margin-bottom: 10px;

  &__item {
    position: relative;
    width: 100%;
    height: 2px;
    margin-right: 4px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;

    &:last-child {
      margin-right: 0;
    }
  }

  &__fill {
    position: absolute;
    width: 100%;
    background: #ffffff;
    height: 2px;
  }
}

.close {
  position: absolute;
  width: 50px;
  height: 50px;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:after{
    content: "\00d7";
    color: #FFFFFF;
    font-weight: 100;
    font-size: 35px;
  }
}
</style>
