import { useEffect, useState } from "react";
import Box from "./components/Box";

type ImageThumbnailProps = {
    fileName: string;
    filePath: string;
    imageData: string;
};
function ImageThumbnail(props: ImageThumbnailProps) {
    return (
        <div className="grid grid-rows-4 bg-zinc-100 w-[150px] h-[150px] border-1 border-sky-300 rounded-md">
            <div className="w-full h-full row-span-3 flex items-center justify-center overflow-hidden">
                <img src={props.imageData} alt={props.fileName} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="bg-sky-400 text-center p-1 overflow-hidden w-full">
                <p className="text-sm text-white truncate select-none">{props.fileName}</p>
            </div>
        </div>
    );
}

export default function App() {
    const [images, setImages] = useState<
        {
            imageDataBase64: string;
            name: string;
            filePath: string;
        }[]
    >([]);
    useEffect(() => {
        const getImages = async () => {
            const images = await window.SpritesPackerApi.getImagesInDirectory();
            setImages(images);
        };

        getImages();
    }, []);
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-grow grid grid-cols-3">
                <div id="left-panel" className="col-span-2">
                    <Box></Box>
                </div>
                <div id="right-panel">
                    <Box></Box>
                </div>
            </div>
            <Box id="botton-panel" className="max-h-[250px] flex-wrap gap-3 overflow-y-scroll">
                {images.map((image, index) => (
                    <ImageThumbnail
                        key={index}
                        imageData={image.imageDataBase64}
                        filePath={image.filePath}
                        fileName={image.name}
                    />
                ))}
            </Box>
        </div>
    );
}
