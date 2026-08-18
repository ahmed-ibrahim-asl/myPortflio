(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,11604,e=>{"use strict";let t=Object.freeze(["core-configuration","data","model","training","evaluation","export"]),a=Object.freeze(["starter","production-oriented"]),i=Object.freeze(["configuration-and-seed","input-validation","data-loading","data-inspection","cleaning","preprocessing-and-augmentation","splitting-and-sampling","loader-and-batch-construction","model-construction","training-and-optimization","evaluation-and-error-analysis","export-and-artifact-summary"]);function o(e){return Object.freeze({...e,supportedDataProfileIds:Object.freeze([...e.supportedDataProfileIds]),tags:Object.freeze([...e.tags]),sourceRefs:Object.freeze([...e.sourceRefs]),pipelineStages:Object.freeze([...e.pipelineStages]),sectionIds:Object.freeze([...e.sectionIds]),presetIds:Object.freeze([...e.presetIds])})}let s=Object.freeze([o({id:"yolo-detection-training",title:"YOLO Custom Object Detection",shortDescription:"Train, validate, infer, and export a YOLOv8 detector without writing the API syntax by hand.",domainId:"computer-vision",taskId:"object-detection",supportedDataProfileIds:["yolo-detection"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLO","detection","bounding boxes","computer vision","edge export"],normalizedKeywords:"yolo custom object detection train validate infer export yolov8 bounding boxes computer vision edge ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:i,sectionIds:t,presetIds:a,generatorModuleId:"yolo-detection-training"}),o({id:"yolo-segmentation-training",title:"YOLO Instance Segmentation",shortDescription:"Configure a YOLOv8 segmentation workflow with polygon-aware guidance and compatible exports.",domainId:"computer-vision",taskId:"instance-segmentation",supportedDataProfileIds:["yolo-segmentation"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLO","segmentation","masks","polygons","computer vision"],normalizedKeywords:"yolo instance segmentation yolov8 masks polygons computer vision train validate infer export ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:i,sectionIds:t,presetIds:a,generatorModuleId:"yolo-segmentation-training"}),o({id:"yoloe-open-vocabulary",title:"YOLOE-26 Open-Vocabulary Detection",shortDescription:"Detect and segment classes supplied as plain-language prompts without retraining the model.",domainId:"computer-vision",taskId:"open-vocabulary-detection",supportedDataProfileIds:["prompted-images"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLOE-26","open vocabulary","text prompts","detection","segmentation"],normalizedKeywords:"yoloe 26 open vocabulary detection segmentation text prompts dynamic classes ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:i,sectionIds:t,presetIds:a,generatorModuleId:"yoloe-open-vocabulary"}),o({id:"yolo26-monocular-depth",title:"YOLO26 Monocular Depth",shortDescription:"Estimate a dense depth map from one ordinary RGB camera, image, or video source.",domainId:"computer-vision",taskId:"monocular-depth",supportedDataProfileIds:["rgb-depth-images"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLO26","depth","monocular camera","robotics","3D perception"],normalizedKeywords:"yolo26 monocular depth normal ordinary rgb camera image distance map robotics ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:i,sectionIds:t,presetIds:a,generatorModuleId:"yolo26-monocular-depth"}),o({id:"unet-semantic-segmentation",title:"U-Net Semantic Segmentation",shortDescription:"Train a complete PyTorch U-Net that assigns one semantic class to every image pixel.",domainId:"computer-vision",taskId:"semantic-segmentation",supportedDataProfileIds:["semantic-mask-images"],frameworkId:"pytorch",difficulty:"intermediate",tags:["U-Net","semantic segmentation","pixel masks","PyTorch","computer vision"],normalizedKeywords:"unet u-net semantic segmentation pixel masks pytorch medical road defect crop",sourceRefs:["pytorch-docs"],pipelineStages:i,sectionIds:t,presetIds:a,generatorModuleId:"unet-semantic-segmentation"}),o({id:"sensor-timeseries-classification",title:"Sensor Time-Series Classification",shortDescription:"Turn ordered sensor rows into overlapping windows and train a deployable temporal classifier.",domainId:"sensor-ai",taskId:"sequence-classification",supportedDataProfileIds:["chronological-sensor-csv"],frameworkId:"pytorch",difficulty:"intermediate",tags:["sensor","time series","CNN","LSTM","fault detection","classification"],normalizedKeywords:"sensor time series classification cnn lstm fault detection chronological csv pytorch edge temporal",sourceRefs:["pytorch-docs","pytorch-deep-learning"],pipelineStages:i,sectionIds:t,presetIds:a,generatorModuleId:"sensor-timeseries-classification"}),o({id:"edge-image-classification",title:"Edge Image Classification",shortDescription:"Train a compact transfer-learning classifier and export a benchmarkable TFLite artifact.",domainId:"deployment",taskId:"edge-image-classification",supportedDataProfileIds:["class-directory-images"],frameworkId:"tensorflow",difficulty:"intermediate",tags:["image classification","edge","TensorFlow Lite","quantization","transfer learning"],normalizedKeywords:"edge image classification tensorflow keras tflite quantization transfer learning mobilenet efficientnet",sourceRefs:["tensorflow-docs","handson-ml3"],pipelineStages:i,sectionIds:t,presetIds:a,generatorModuleId:"edge-image-classification"})]);e.s(["getRecipeManifest",0,function(e){return s.find(({id:t})=>t===e)??null}])},9426,e=>{"use strict";let t=[{value:"nano",label:"Nano"},{value:"small",label:"Small"},{value:"medium",label:"Medium"},{value:"large",label:"Large"},{value:"extra-large",label:"Extra-large"}],a={nano:"n",small:"s",medium:"m",large:"l","extra-large":"x"},i=[320,512,640,768,960].map(e=>({value:String(e),label:`${e} px`}));function o(e){return!0===e?"True":!1===e?"False":null==e?"None":"number"==typeof e&&Number.isFinite(e)?String(e):Array.isArray(e)?`[${e.map(e=>o(e)).join(", ")}]`:JSON.stringify(String(e))}function s(e,t,a){return new Set(t.map(({value:e})=>e)).has(String(e))?String(e):a}function n(e,t){let a=Number(e);return Number.isFinite(a)?a:t}function r(e,t){return String(e??"").trim()||t}function l(e){return String(e??"").split(",").map(e=>e.trim()).filter(Boolean).slice(0,24)}let d=[{package:"ultralytics",version:">=8.4,<9",purpose:"YOLO26 and YOLOE model execution"},{package:"torch",version:">=2.3,<3",purpose:"Model execution and acceleration"},{package:"opencv-python",version:">=4.10,<5",purpose:"Images, cameras, and result output"}],c={starter:{modelSize:"small",classPrompts:"workshop helmet, safety glasses, circuit board, damaged connector",sourcePath:"./workshop.jpg",imageSize:"640",confidence:.25,outputDirectory:"./runs/open_vocabulary"},production:{modelSize:"medium",classPrompts:"workshop helmet, safety glasses, circuit board, damaged connector",sourcePath:"./workshop.jpg",imageSize:"640",confidence:.3,outputDirectory:"./runs/open_vocabulary"}},m={id:"yoloe-open-vocabulary",fields:[{id:"sourcePath",label:"Image or video",inputType:"text",modes:["starter","production"],helpText:"Path to the scene you want to inspect."},{id:"classPrompts",label:"Objects to find",inputType:"text",modes:["starter","production"],helpText:"Comma-separated plain-language prompts such as workshop helmet or damaged connector."},{id:"imageSize",label:"Image size",inputType:"select",modes:["starter","production"],options:i,helpText:"Inference resolution."},{id:"modelSize",label:"YOLOE-26 size",inputType:"select",modes:["starter","production"],options:t.slice(1,4),helpText:"Larger models need more memory."},{id:"confidence",label:"Confidence",inputType:"number",modes:["starter","production"],min:0,max:1,step:.01,helpText:"Minimum score retained in the results."},{id:"outputDirectory",label:"Output directory",inputType:"text",modes:["starter","production"],helpText:"Directory for annotated results."}],defaults:c,normalize:function(e,a){let o=c["production"===a?"production":"starter"],d={...o,...e??{}};return d.modelSize=s(d.modelSize,t,o.modelSize),d.imageSize=s(d.imageSize,i,o.imageSize),d.classPrompts=l(d.classPrompts).join(", "),d.sourcePath=r(d.sourcePath,o.sourcePath),d.outputDirectory=r(d.outputDirectory,o.outputDirectory),d.confidence=n(d.confidence,o.confidence),d},validate:function(e){let t={};return 0===l(e.classPrompts).length&&(t.classPrompts="Enter at least one class prompt."),(e.confidence<0||e.confidence>1)&&(t.confidence="Confidence must be between 0 and 1."),t},generate:function(e){let t=`yoloe-26${a[e.modelSize]??"s"}-seg.pt`,i=l(e.classPrompts);return`"""Prompted detection and segmentation with Ultralytics YOLOE-26."""
from pathlib import Path

from ultralytics import YOLOE


CONFIG = {
    "model": ${o(t)},
    "classes": ${o(i)},
    "source": ${o(e.sourcePath)},
    "image_size": ${o(Number(e.imageSize))},
    "confidence": ${o(e.confidence)},
    "output_directory": ${o(e.outputDirectory)},
}


def main() -> None:
    source = Path(CONFIG["source"]).expanduser()
    if not source.exists():
        raise FileNotFoundError(f"Image or video source not found: {source}")
    output_directory = Path(CONFIG["output_directory"])
    output_directory.mkdir(parents=True, exist_ok=True)

    model = YOLOE(CONFIG["model"])
    model.set_classes(CONFIG["classes"])
    results = model.predict(
        source=str(source),
        imgsz=CONFIG["image_size"],
        conf=CONFIG["confidence"],
        save=True,
        project=str(output_directory),
        name="prompted_results",
        exist_ok=True,
    )
    detections = sum(0 if result.boxes is None else len(result.boxes) for result in results)
    print(f"Prompted classes: {', '.join(CONFIG['classes'])}")
    print(f"Detections: {detections}")
    print(f"Saved results under: {output_directory.resolve()}")


if __name__ == "__main__":
    main()
`},filename:()=>"detect_prompted_objects.py",dependencies:d,dataset:{title:"Prompted scene",summary:"An image or video plus class names expressed as text.",structure:"project/\n  workshop.jpg\n  detect_prompted_objects.py"},metrics:["Detection count","Confidence","Per-class results","Inference time"],hardware:{minimum:"Modern CPU and 8 GB RAM for a small image.",recommended:"CUDA-capable GPU for video or medium/large models."},deployment:["Python inference","Saved annotated images and video"],notes:["Text prompts can change between runs without retraining."],warnings:["Open-vocabulary results still require review on your real camera and environment."],getWarnings:()=>[],getReadiness:e=>({source:e.sourcePath?"configured":"blocked",prompts:l(e.classPrompts).length>0?"configured":"blocked"})},p={starter:{sourceMode:"image",sourcePath:"./room.jpg",cameraIndex:0,modelSize:"nano",imageSize:"768",outputPath:"./depth_output"},production:{sourceMode:"camera",sourcePath:"./room.jpg",cameraIndex:0,modelSize:"small",imageSize:"768",outputPath:"./depth_output"}},u=[{value:"image",label:"Image or video file"},{value:"camera",label:"Ordinary RGB camera"}],g={starter:{datasetDirectory:"./segmentation_dataset",sampleImagePath:"./segmentation_dataset/images/sample.png",imageSize:"320",numClasses:3,baseChannels:32,validationFraction:.2,epochs:20,batchSize:4,learningRate:.001,seed:42,checkpointPath:"./artifacts/best_unet.pt",predictionPath:"./artifacts/sample_mask.png"},production:{datasetDirectory:"./segmentation_dataset",sampleImagePath:"./segmentation_dataset/images/sample.png",imageSize:"512",numClasses:3,baseChannels:64,validationFraction:.2,epochs:80,batchSize:8,learningRate:3e-4,seed:42,checkpointPath:"./artifacts/best_unet.pt",predictionPath:"./artifacts/sample_mask.png"}};e.s(["UNET_SEMANTIC_SEGMENTATION_TEMPLATE",0,{id:"unet-semantic-segmentation",fields:[{id:"datasetDirectory",label:"Dataset directory",inputType:"text",modes:["starter","production"],helpText:"Folder containing images/ and masks/ with matching filenames."},{id:"sampleImagePath",label:"Prediction example",inputType:"text",modes:["starter","production"],helpText:"An image used to demonstrate mask prediction after training."},{id:"validationFraction",label:"Validation fraction",inputType:"number",modes:["starter","production"],min:.05,max:.49,step:.05,helpText:"Part of the dataset reserved for honest validation."},{id:"imageSize",label:"Image size",inputType:"select",modes:["starter","production"],options:i,helpText:"Square training resolution."},{id:"numClasses",label:"Semantic classes",inputType:"number",modes:["starter","production"],min:2,max:256,step:1,helpText:"Includes the background class."},{id:"baseChannels",label:"Base channels",inputType:"number",modes:["starter","production"],min:8,max:256,step:8,helpText:"Controls U-Net capacity and memory use."},{id:"epochs",label:"Epochs",inputType:"number",modes:["starter","production"],min:1,max:500,step:1,helpText:"Complete passes through the training images."},{id:"batchSize",label:"Batch size",inputType:"number",modes:["starter","production"],min:1,max:64,step:1,helpText:"Reduce this if accelerator memory is limited."},{id:"learningRate",label:"Learning rate",inputType:"number",modes:["starter","production"],min:1e-6,max:1,step:1e-4,helpText:"AdamW optimizer step size."},{id:"seed",label:"Random seed",inputType:"number",modes:["starter","production"],min:0,max:0x7fffffff,step:1,helpText:"Keeps the split and initialization repeatable."},{id:"checkpointPath",label:"Best checkpoint",inputType:"text",modes:["starter","production"],helpText:"Where the highest validation-IoU weights are saved."},{id:"predictionPath",label:"Example mask output",inputType:"text",modes:["starter","production"],helpText:"Where the predicted class-index mask is saved."}],defaults:g,normalize:function(e,t){let a=g["production"===t?"production":"starter"],o={...a,...e??{}};for(let e of["numClasses","baseChannels","epochs","batchSize","seed"])o[e]=Math.trunc(n(o[e],a[e]));for(let e of(o.learningRate=n(o.learningRate,a.learningRate),o.validationFraction=n(o.validationFraction,a.validationFraction),o.imageSize=s(o.imageSize,i,a.imageSize),["datasetDirectory","sampleImagePath","checkpointPath","predictionPath"]))o[e]=r(o[e],a[e]);return o},validate:function(e){let t={};return(e.numClasses<2||e.numClasses>256)&&(t.numClasses="Classes must be between 2 and 256."),(e.baseChannels<8||e.baseChannels>256)&&(t.baseChannels="Base channels must be between 8 and 256."),e.epochs<1&&(t.epochs="Epochs must be at least 1."),e.batchSize<1&&(t.batchSize="Batch size must be at least 1."),(e.learningRate<=0||e.learningRate>1)&&(t.learningRate="Learning rate must be greater than 0 and at most 1."),(e.validationFraction<=0||e.validationFraction>=.5)&&(t.validationFraction="Validation fraction must be greater than 0 and less than 0.5."),t},generate:function(e){return`"""Complete PyTorch U-Net workflow for semantic segmentation."""
import random
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision.transforms import functional as TF


CONFIG = {
    "dataset_directory": ${o(e.datasetDirectory)},
    "sample_image_path": ${o(e.sampleImagePath)},
    "image_size": ${o(Number(e.imageSize))},
    "num_classes": ${o(e.numClasses)},
    "base_channels": ${o(e.baseChannels)},
    "validation_fraction": ${o(e.validationFraction)},
    "epochs": ${o(e.epochs)},
    "batch_size": ${o(e.batchSize)},
    "learning_rate": ${o(e.learningRate)},
    "seed": ${o(e.seed)},
    "checkpoint_path": ${o(e.checkpointPath)},
    "prediction_path": ${o(e.predictionPath)},
}


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


class SegmentationDataset(Dataset):
    def __init__(self, root: Path, image_size: int) -> None:
        self.image_directory = root / "images"
        self.mask_directory = root / "masks"
        self.image_size = image_size
        if not self.image_directory.is_dir() or not self.mask_directory.is_dir():
            raise FileNotFoundError("Dataset needs images/ and masks/ directories.")
        self.images = sorted(path for path in self.image_directory.iterdir() if path.is_file())
        self.pairs = [(image, self.mask_directory / image.name) for image in self.images]
        self.pairs = [(image, mask) for image, mask in self.pairs if mask.is_file()]
        if not self.pairs:
            raise ValueError("No image/mask pairs with matching filenames were found.")

    def __len__(self) -> int:
        return len(self.pairs)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        image_path, mask_path = self.pairs[index]
        image = Image.open(image_path).convert("RGB")
        mask = Image.open(mask_path).convert("L")
        image = TF.resize(image, [self.image_size, self.image_size], antialias=True)
        mask = TF.resize(mask, [self.image_size, self.image_size], interpolation=TF.InterpolationMode.NEAREST)
        image_tensor = TF.to_tensor(image)
        mask_tensor = torch.from_numpy(np.asarray(mask, dtype=np.int64).copy()).long()
        if int(mask_tensor.max()) >= CONFIG["num_classes"]:
            raise ValueError(f"Mask {mask_path} contains a class index outside num_classes.")
        return image_tensor, mask_tensor


class DoubleConv(nn.Module):
    def __init__(self, input_channels: int, output_channels: int) -> None:
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(input_channels, output_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(output_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(output_channels, output_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(output_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.block(inputs)


class UNet(nn.Module):
    def __init__(self, num_classes: int, base_channels: int) -> None:
        super().__init__()
        b = base_channels
        self.pool = nn.MaxPool2d(2)
        self.encoder1 = DoubleConv(3, b)
        self.encoder2 = DoubleConv(b, b * 2)
        self.encoder3 = DoubleConv(b * 2, b * 4)
        self.bridge = DoubleConv(b * 4, b * 8)
        self.up3 = nn.ConvTranspose2d(b * 8, b * 4, 2, stride=2)
        self.decoder3 = DoubleConv(b * 8, b * 4)
        self.up2 = nn.ConvTranspose2d(b * 4, b * 2, 2, stride=2)
        self.decoder2 = DoubleConv(b * 4, b * 2)
        self.up1 = nn.ConvTranspose2d(b * 2, b, 2, stride=2)
        self.decoder1 = DoubleConv(b * 2, b)
        self.head = nn.Conv2d(b, num_classes, 1)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        e1 = self.encoder1(inputs)
        e2 = self.encoder2(self.pool(e1))
        e3 = self.encoder3(self.pool(e2))
        bridge = self.bridge(self.pool(e3))
        d3 = self.decoder3(torch.cat([self.up3(bridge), e3], dim=1))
        d2 = self.decoder2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.decoder1(torch.cat([self.up1(d2), e1], dim=1))
        return self.head(d1)


def mean_iou(logits: torch.Tensor, targets: torch.Tensor, num_classes: int) -> float:
    predictions = logits.argmax(dim=1)
    scores = []
    for class_index in range(num_classes):
        predicted = predictions == class_index
        actual = targets == class_index
        union = (predicted | actual).sum().item()
        if union:
            scores.append((predicted & actual).sum().item() / union)
    return float(np.mean(scores)) if scores else 0.0


def train_epoch(model, loader, optimizer, criterion, device) -> float:
    model.train()
    total_loss = 0.0
    for images, masks in loader:
        images, masks = images.to(device), masks.to(device)
        optimizer.zero_grad(set_to_none=True)
        loss = criterion(model(images), masks)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
    return total_loss / len(loader.dataset)


@torch.no_grad()
def evaluate(model, loader, criterion, device) -> tuple[float, float]:
    model.eval()
    total_loss = 0.0
    total_iou = 0.0
    for images, masks in loader:
        images, masks = images.to(device), masks.to(device)
        logits = model(images)
        total_loss += criterion(logits, masks).item() * images.size(0)
        total_iou += mean_iou(logits, masks, CONFIG["num_classes"]) * images.size(0)
    count = len(loader.dataset)
    return total_loss / count, total_iou / count


@torch.no_grad()
def predict_mask(model, image_path: Path, output_path: Path, device) -> None:
    image = Image.open(image_path).convert("RGB")
    resized = TF.resize(image, [CONFIG["image_size"], CONFIG["image_size"]], antialias=True)
    tensor = TF.to_tensor(resized).unsqueeze(0).to(device)
    mask = model(tensor).argmax(dim=1).squeeze(0).byte().cpu().numpy()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(mask).save(output_path)


def main() -> None:
    set_seed(CONFIG["seed"])
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    dataset = SegmentationDataset(Path(CONFIG["dataset_directory"]), CONFIG["image_size"])
    validation_count = max(1, round(len(dataset) * CONFIG["validation_fraction"]))
    training_count = len(dataset) - validation_count
    if training_count < 1:
        raise ValueError("Add more image/mask pairs so both training and validation are non-empty.")
    generator = torch.Generator().manual_seed(CONFIG["seed"])
    train_data, validation_data = random_split(dataset, [training_count, validation_count], generator=generator)
    train_loader = DataLoader(train_data, batch_size=CONFIG["batch_size"], shuffle=True)
    validation_loader = DataLoader(validation_data, batch_size=CONFIG["batch_size"], shuffle=False)

    model = UNet(CONFIG["num_classes"], CONFIG["base_channels"]).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=CONFIG["learning_rate"])
    criterion = nn.CrossEntropyLoss()
    checkpoint = Path(CONFIG["checkpoint_path"])
    checkpoint.parent.mkdir(parents=True, exist_ok=True)
    best_iou = -1.0

    for epoch in range(1, CONFIG["epochs"] + 1):
        train_loss = train_epoch(model, train_loader, optimizer, criterion, device)
        validation_loss, validation_iou = evaluate(model, validation_loader, criterion, device)
        print(f"epoch={epoch:03d} train_loss={train_loss:.4f} val_loss={validation_loss:.4f} mean_iou={validation_iou:.4f}")
        if validation_iou > best_iou:
            best_iou = validation_iou
            torch.save(model.state_dict(), checkpoint)

    model.load_state_dict(torch.load(checkpoint, map_location=device, weights_only=True))
    sample = Path(CONFIG["sample_image_path"])
    if sample.is_file():
        predict_mask(model, sample, Path(CONFIG["prediction_path"]), device)
    print(f"Best mean IoU: {best_iou:.4f}")
    print(f"Checkpoint: {checkpoint.resolve()}")


if __name__ == "__main__":
    main()
`},filename:()=>"train_unet_semantic_segmentation.py",dependencies:[{package:"torch",version:">=2.3,<3",purpose:"U-Net training and inference"},{package:"torchvision",version:">=0.18,<1",purpose:"Image and mask resizing"},{package:"Pillow",version:">=10,<12",purpose:"Image and indexed-mask files"},{package:"numpy",version:">=1.26,<3",purpose:"Mask arrays and mean IoU"}],dataset:{title:"Semantic image masks",summary:"RGB images paired with single-channel masks whose pixel values are class indices.",structure:"segmentation_dataset/\n  images/\n    sample.png\n  masks/\n    sample.png"},metrics:["Cross-entropy loss","Mean Intersection over Union","Best validation checkpoint"],hardware:{minimum:"Modern CPU and 8 GB RAM at 320 px with a small U-Net.",recommended:"CUDA GPU with at least 8 GB VRAM for 512 px training."},deployment:["PyTorch checkpoint","Indexed PNG prediction mask"],notes:["Mask pixel values must be integer class indices from 0 through num_classes - 1."],warnings:["A random split is only appropriate when related scenes or subjects cannot leak across the split."],getWarnings:()=>[],getReadiness:e=>({dataset:e.datasetDirectory?"configured":"blocked",checkpoint:e.checkpointPath?"configured":"blocked"})},"YOLO26_DEPTH_TEMPLATE",0,{id:"yolo26-monocular-depth",fields:[{id:"sourceMode",label:"Source",inputType:"select",modes:["starter","production"],options:u,helpText:"Use a file or a normal RGB webcam."},{id:"sourcePath",label:"Image or video",inputType:"text",modes:["starter","production"],visibleWhen:({sourceMode:e})=>"image"===e,helpText:"Path to an RGB image or video."},{id:"cameraIndex",label:"Camera index",inputType:"number",modes:["starter","production"],min:0,max:16,step:1,visibleWhen:({sourceMode:e})=>"camera"===e,helpText:"Usually zero for the built-in or first USB camera."},{id:"imageSize",label:"Image size",inputType:"select",modes:["starter","production"],options:i,helpText:"YOLO26 depth weights are optimized around 768 px."},{id:"modelSize",label:"YOLO26 depth size",inputType:"select",modes:["starter","production"],options:t,helpText:"Nano is the quickest starting point."},{id:"outputPath",label:"Depth output",inputType:"text",modes:["starter","production"],helpText:"Directory for colorized depth maps."}],defaults:p,normalize:function(e,a){let o=p["production"===a?"production":"starter"],l={...o,...e??{}};return l.sourceMode=s(l.sourceMode,u,o.sourceMode),l.modelSize=s(l.modelSize,t,o.modelSize),l.imageSize=s(l.imageSize,i,o.imageSize),l.sourcePath=r(l.sourcePath,o.sourcePath),l.outputPath=r(l.outputPath,o.outputPath),l.cameraIndex=Math.max(0,Math.trunc(n(l.cameraIndex,o.cameraIndex))),l},validate:function(e){let t={};return"image"!==e.sourceMode||e.sourcePath||(t.sourcePath="Choose an image or video source."),t},generate:function(e){let t=`yolo26${a[e.modelSize]??"n"}-depth.pt`;return`"""Dense monocular depth from an ordinary RGB image, video, or camera."""
from pathlib import Path

import cv2
from ultralytics import YOLO
from ultralytics.utils.plotting import colorize_depth


CONFIG = {
    "model": ${o(t)},
    "source_mode": ${o(e.sourceMode)},
    "source_path": ${o(e.sourcePath)},
    "camera_index": ${o(e.cameraIndex)},
    "image_size": ${o(Number(e.imageSize))},
    "output_path": ${o(e.outputPath)},
}


def save_depth(result, destination: Path, frame_number: int) -> None:
    depth = result.depth.data.cpu().numpy()
    colored = colorize_depth(depth, cmap="spectral")
    filename = destination / f"depth_{frame_number:05d}.png"
    if not cv2.imwrite(str(filename), colored):
        raise RuntimeError(f"Could not save depth map: {filename}")
    print(
        f"{filename.name}: min={float(depth.min()):.3f} m, "
        f"max={float(depth.max()):.3f} m"
    )


def main() -> None:
    destination = Path(CONFIG["output_path"])
    destination.mkdir(parents=True, exist_ok=True)
    model = YOLO(CONFIG["model"])

    if CONFIG["source_mode"] == "camera":
        source = int(CONFIG["camera_index"])
        results = model.predict(source=source, imgsz=CONFIG["image_size"], stream=True)
        for frame_number, result in enumerate(results):
            save_depth(result, destination, frame_number)
            if frame_number >= 299:
                break
    else:
        source = Path(CONFIG["source_path"]).expanduser()
        if not source.exists():
            raise FileNotFoundError(f"Image or video source not found: {source}")
        results = model.predict(source=str(source), imgsz=CONFIG["image_size"], stream=False)
        for frame_number, result in enumerate(results):
            save_depth(result, destination, frame_number)

    print(f"Depth maps saved under: {destination.resolve()}")


if __name__ == "__main__":
    main()
`},filename:()=>"estimate_monocular_depth.py",dependencies:d,dataset:{title:"Ordinary RGB source",summary:"A single image, video, or RGB camera; no stereo camera is required for inference.",structure:"project/\n  room.jpg\n  estimate_monocular_depth.py"},metrics:["Per-pixel depth in meters","Minimum depth","Maximum depth","Inference time"],hardware:{minimum:"Modern CPU and 8 GB RAM with the nano model.",recommended:"CUDA-capable GPU for live camera throughput."},deployment:["Python image inference","RGB camera stream","Colorized PNG depth maps"],notes:["Monocular depth estimates distance from one RGB view; validate accuracy in your physical scene."],warnings:["Do not use unvalidated monocular depth as the only safety sensor in a critical system."],getWarnings:()=>[],getReadiness:e=>({source:"camera"===e.sourceMode||e.sourcePath?"configured":"blocked",output:e.outputPath?"configured":"blocked"})},"YOLOE_OPEN_VOCABULARY_TEMPLATE",0,m])},75339,e=>{"use strict";var t=e.i(11604),a=e.i(9426);let i=(0,t.getRecipeManifest)("yoloe-open-vocabulary"),o=Object.freeze({...i,...a.YOLOE_OPEN_VOCABULARY_TEMPLATE,artifacts:["Annotated prompted detections","Detection and mask results"]});e.s(["manifest",0,i,"recipe",0,o])}]);