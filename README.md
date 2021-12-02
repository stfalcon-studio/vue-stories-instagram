## Simple usage
```vue
<template>
  <Stories :stories="items" />
</template>

<script>
import Stories from "vue-stories-instagram";

export default {
  components: { Stories },
  data: () => ({
    items: [
      {
        username: "Jessica Valentine",
        picture: "https://randomuser.me/api/portraits/men/61.jpg",
        time: "12h",
        images: [
          {
            url: "https://randomwordgenerator.com/img/picture-generator/57e7d4414d51a814f1dc8460962e33791c3ad6e04e50744172287cd09e49cd_640.jpg",
            viewed: true,
          },
          {
            url: "https://randomwordgenerator.com/img/picture-generator/55e4d5474350b10ff3d8992cc12c30771037dbf852547849712a73d5954d_640.jpg",
            viewed: true,
          },
          {
            url: "https://randomwordgenerator.com/img/picture-generator/54e2d3414950a914f1dc8460962e33791c3ad6e04e5074417d2e72d29e4ecd_640.jpg",
            viewed: false,
          },
          {
            url: "https://cdn.videvo.net/videvo_files/video/free/2014-12/large_watermarked/Metal_Wind_Chimes_at_Sunset_preview.mp4",
            viewed: false,
            type: 'video',
          },
        ],
      },
    ]
  })
};
</script>
```