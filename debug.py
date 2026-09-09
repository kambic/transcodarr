import asyncio

import ffmpeg

def read_frame_as_jpeg(in_filename, frame_num):
    out, err = (
        ffmpeg
        .input(in_filename)
        .filter('select', 'gte(n,{})'.format(frame_num))
        .output('pipe:', vframes=1, format='image2', vcodec='mjpeg')
        .run(capture_stdout=True)
    )
    return out

def main():
    input = ffmpeg.input('lib/blender/bbb/bbb_sunflower_1080p_30fps_normal.mp4')
    audio = input.audio.filter("aecho", 0.8, 0.9, 1000, 0.3)
    video = input.video.hflip()
    out = ffmpeg.output(audio, video, 'out.mp4')
    out.run()


if __name__ == "__main__":
    main()
    # asyncio.run(main())