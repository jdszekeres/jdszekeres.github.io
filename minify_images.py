import PIL.Image as Image
import os


def compress_images(directory, max_width=512):
    for filename in os.listdir(directory):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            image = Image.open(os.path.join(directory, filename))
            width, height = image.size

            if width > max_width:
                new_height = int(height * max_width / width)
                image = image.resize((max_width, new_height))

            compressed_filename = os.path.join(directory, filename)
            image.save(compressed_filename, optimize=True, quality=80)


if __name__ == "__main__":
    directory = "project-photos"
    compress_images(directory)
