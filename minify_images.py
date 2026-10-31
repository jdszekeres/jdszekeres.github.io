import PIL.Image as Image
import os


def compress_images(directory, max_width=512):
    # List recursively all files in the directory and its subdirectories
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".jpg") or filename.endswith(".png") or filename.endswith(".jpeg") or filename.endswith(".gif"):
                image = Image.open(os.path.join(root, filename))
                width, height = image.size

                if width > max_width:
                    new_height = int(height * max_width / width)
                    image = image.resize((max_width, new_height))

                compressed_filename = os.path.join(root, filename)
                image.save(compressed_filename, optimize=True, quality=80)




if __name__ == "__main__":

    directories = ["project-photos", "company_logos"]  # List of directories to compress images in

    for directory in directories:
        compress_images(directory)

    all_files = []
    for directory in directories:
        for root, dirs, files in os.walk(directory):
            all_files.extend([os.path.join(root, f) for f in files if f.endswith((".jpg", ".png", ".jpeg", ".gif"))])

    file_size = 0
    for i in all_files:
        if not (i.endswith(".jpg") or i.endswith(".png") or i.endswith(".jpeg") or i.endswith(".gif")):
            continue
        file_size += os.path.getsize(i)

    print(f"Total size of all images: {file_size / (1024 * 1024):.2f} MB")
