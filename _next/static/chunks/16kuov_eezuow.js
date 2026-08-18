(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,11604,e=>{"use strict";let t=Object.freeze(["core-configuration","data","model","training","evaluation","export"]),i=Object.freeze(["starter","production-oriented"]),a=Object.freeze(["configuration-and-seed","input-validation","data-loading","data-inspection","cleaning","preprocessing-and-augmentation","splitting-and-sampling","loader-and-batch-construction","model-construction","training-and-optimization","evaluation-and-error-analysis","export-and-artifact-summary"]);function r(e){return Object.freeze({...e,supportedDataProfileIds:Object.freeze([...e.supportedDataProfileIds]),tags:Object.freeze([...e.tags]),sourceRefs:Object.freeze([...e.sourceRefs]),pipelineStages:Object.freeze([...e.pipelineStages]),sectionIds:Object.freeze([...e.sectionIds]),presetIds:Object.freeze([...e.presetIds])})}let o=Object.freeze([r({id:"yolo-detection-training",title:"YOLO Custom Object Detection",shortDescription:"Train, validate, infer, and export a YOLOv8 detector without writing the API syntax by hand.",domainId:"computer-vision",taskId:"object-detection",supportedDataProfileIds:["yolo-detection"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLO","detection","bounding boxes","computer vision","edge export"],normalizedKeywords:"yolo custom object detection train validate infer export yolov8 bounding boxes computer vision edge ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:a,sectionIds:t,presetIds:i,generatorModuleId:"yolo-detection-training"}),r({id:"yolo-segmentation-training",title:"YOLO Instance Segmentation",shortDescription:"Configure a YOLOv8 segmentation workflow with polygon-aware guidance and compatible exports.",domainId:"computer-vision",taskId:"instance-segmentation",supportedDataProfileIds:["yolo-segmentation"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLO","segmentation","masks","polygons","computer vision"],normalizedKeywords:"yolo instance segmentation yolov8 masks polygons computer vision train validate infer export ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:a,sectionIds:t,presetIds:i,generatorModuleId:"yolo-segmentation-training"}),r({id:"sensor-timeseries-classification",title:"Sensor Time-Series Classification",shortDescription:"Turn ordered sensor rows into overlapping windows and train a deployable temporal classifier.",domainId:"sensor-ai",taskId:"sequence-classification",supportedDataProfileIds:["chronological-sensor-csv"],frameworkId:"pytorch",difficulty:"intermediate",tags:["sensor","time series","CNN","LSTM","fault detection","classification"],normalizedKeywords:"sensor time series classification cnn lstm fault detection chronological csv pytorch edge temporal",sourceRefs:["pytorch-docs","pytorch-deep-learning"],pipelineStages:a,sectionIds:t,presetIds:i,generatorModuleId:"sensor-timeseries-classification"}),r({id:"edge-image-classification",title:"Edge Image Classification",shortDescription:"Train a compact transfer-learning classifier and export a benchmarkable TFLite artifact.",domainId:"deployment",taskId:"edge-image-classification",supportedDataProfileIds:["class-directory-images"],frameworkId:"tensorflow",difficulty:"intermediate",tags:["image classification","edge","TensorFlow Lite","quantization","transfer learning"],normalizedKeywords:"edge image classification tensorflow keras tflite quantization transfer learning mobilenet efficientnet",sourceRefs:["tensorflow-docs","handson-ml3"],pipelineStages:a,sectionIds:t,presetIds:i,generatorModuleId:"edge-image-classification"})]);e.s(["getRecipeManifest",0,function(e){return o.find(({id:t})=>t===e)??null}])},38717,e=>{"use strict";let t=new Set(["starter","production"]),i=[{value:"train",label:"Train + validate + infer"},{value:"validate",label:"Validate existing weights"},{value:"inference",label:"Inference only"},{value:"train-export",label:"Train + validate + infer + export"}],a=[{value:"nano",label:"Nano"},{value:"small",label:"Small"},{value:"medium",label:"Medium"},{value:"large",label:"Large"},{value:"extra-large",label:"Extra-large"}],r=[{value:"local",label:"Local machine"},{value:"colab",label:"Google Colab"},{value:"nvidia-gpu",label:"NVIDIA GPU workstation"},{value:"jetson",label:"NVIDIA Jetson"},{value:"raspberry-pi",label:"Raspberry Pi"}],o=[320,416,640,960,1280].map(e=>({value:String(e),label:`${e} px`})),n=[{value:"auto",label:"Automatic"},{value:"SGD",label:"SGD"},{value:"Adam",label:"Adam"},{value:"AdamW",label:"AdamW"},{value:"NAdam",label:"NAdam"},{value:"RAdam",label:"RAdam"},{value:"RMSProp",label:"RMSProp"}],s={auto:"Auto-detect",cpu:"CPU","cuda:0":"CUDA GPU 0"},d={local:["auto","cpu"],colab:["auto","cpu","cuda:0"],"nvidia-gpu":["auto","cuda:0"],jetson:["auto","cuda:0"],"raspberry-pi":["cpu"]},l={onnx:"ONNX",openvino:"OpenVINO",torchscript:"TorchScript",engine:"TensorRT engine",tflite:"TensorFlow Lite"},c={local:["onnx","openvino","torchscript"],colab:["onnx","torchscript"],"nvidia-gpu":["onnx","engine","torchscript"],jetson:["onnx","engine"],"raspberry-pi":["onnx","openvino","tflite"]},m={nano:"yolov8n.pt",small:"yolov8s.pt",medium:"yolov8m.pt",large:"yolov8l.pt","extra-large":"yolov8x.pt"},p=({task:e})=>["train","train-export"].includes(e),u=({task:e})=>["train","validate","train-export"].includes(e),h=({task:e})=>["train","inference","train-export"].includes(e),f=({task:e})=>"train-export"===e;function g(e){return t.has(e)?e:"starter"}function y(e,t,i){let a=new Set(t.map(e=>e.value));return a.has(String(e))?String(e):a.has(String(i))?String(i):t[0]?.value??""}function b(e){return structuredClone(e)}function v(e,t){return e.map(e=>({value:e,label:t[e]??e}))}function _(e,t){return"boolean"==typeof e?e:"true"===e||"false"!==e&&t}function x({defaultRunName:e,defaultProjectDirectory:t}){return[{id:"task",label:"Workflow",inputType:"select",modes:["starter","production"],helpText:"Choose the actions the generated script performs.",options:i},{id:"modelSize",label:"Model size",inputType:"select",modes:["starter","production"],helpText:"Larger models can improve accuracy but need more memory and time.",options:a},{id:"environment",label:"Runtime target",inputType:"select",modes:["starter","production"],helpText:"Filters compatible devices and exports; output remains a Python script.",options:r},{id:"datasetYaml",label:"Dataset YAML",inputType:"text",modes:["starter","production"],helpText:"Path to a YOLO data.yaml file with train, val, and names entries.",visibleWhen:u},{id:"sourcePath",label:"Inference source",inputType:"text",modes:["starter","production"],helpText:"Image, video, directory, or stream used for the inference example.",visibleWhen:h},{id:"imageSize",label:"Image size",inputType:"select",modes:["starter","production"],helpText:"Square input resolution used for training and prediction.",options:o},{id:"epochs",label:"Epochs",inputType:"number",modes:["production"],helpText:"Complete passes over the training data.",min:1,max:500,step:1,visibleWhen:p},{id:"batchSize",label:"Batch size",inputType:"number",modes:["production"],helpText:"Use -1 for automatic sizing, or choose 1 to 256.",min:-1,max:256,step:1,visibleWhen:({task:e})=>"inference"!==e},{id:"device",label:"Compute device",inputType:"select",modes:["production"],helpText:"Resolved again at runtime so unavailable CUDA fails clearly.",getOptions:e=>v(d[e.environment]??[],s)},{id:"learningRate",label:"Learning rate",inputType:"number",modes:["production"],helpText:"Initial optimizer learning rate.",min:1e-6,max:1,step:1e-4,visibleWhen:e=>p(e)&&"auto"!==e.optimizer},{id:"optimizer",label:"Optimizer",inputType:"select",modes:["production"],helpText:"Automatic selection chooses a compatible optimizer and learning rate.",options:n,visibleWhen:p},{id:"validationConfidence",label:"Validation confidence",inputType:"number",modes:["production"],helpText:"Minimum confidence retained while calculating validation metrics.",min:0,max:1,step:.01,visibleWhen:u},{id:"predictionConfidence",label:"Prediction confidence",inputType:"number",modes:["production"],helpText:"Minimum confidence retained in saved prediction results.",min:0,max:1,step:.01,visibleWhen:h},{id:"weightDecay",label:"Weight decay",inputType:"number",modes:["production"],helpText:"Regularization strength applied while training.",min:0,step:1e-4,visibleWhen:p},{id:"momentum",label:"Momentum",inputType:"number",modes:["production"],helpText:"Momentum used by momentum-based optimizers.",min:0,max:1,step:.001,visibleWhen:p},{id:"warmupEpochs",label:"Warmup epochs",inputType:"number",modes:["production"],helpText:"Training epochs used to ramp up optimization safely.",min:0,step:1,visibleWhen:p},{id:"freezeLayers",label:"Freeze layers",inputType:"number",modes:["production"],helpText:"Number of leading layers kept fixed during fine-tuning.",min:0,step:1,visibleWhen:p},{id:"iouThreshold",label:"IoU threshold",inputType:"number",modes:["production"],helpText:"IoU threshold used when removing overlapping detections.",min:0,max:1,step:.01,visibleWhen:e=>u(e)||h(e)},{id:"deterministic",label:"Deterministic training",inputType:"toggle",modes:["production"],helpText:"Favor repeatable training behavior over some runtime performance.",visibleWhen:p},{id:"patience",label:"Early-stop patience",inputType:"number",modes:["production"],helpText:"Epochs without improvement before training stops; zero disables it.",min:0,max:200,step:1,visibleWhen:p},{id:"workers",label:"Data workers",inputType:"number",modes:["production"],helpText:"Parallel workers used while loading data.",min:0,max:32,step:1,visibleWhen:({task:e})=>"inference"!==e},{id:"seed",label:"Random seed",inputType:"number",modes:["production"],helpText:"Seeds Python, NumPy, and PyTorch.",min:0,max:0x7fffffff,step:1},{id:"exportFormat",label:"Export format",inputType:"select",modes:["production"],helpText:"Only formats compatible with the runtime target are offered.",getOptions:e=>v(c[e.environment]??[],l),visibleWhen:f},{id:"runName",label:"Run name",inputType:"text",modes:["production"],helpText:"Safe folder name for checkpoints and predictions.",defaultValue:e,visibleWhen:({task:e})=>"inference"!==e},{id:"projectDirectory",label:"Project directory",inputType:"text",modes:["production"],helpText:"Directory that receives runs, checkpoints, and predictions.",defaultValue:t},{id:"cacheDataset",label:"Cache dataset",inputType:"toggle",modes:["production"],helpText:"Cache images when memory and storage allow it.",visibleWhen:p},{id:"useAmp",label:"Mixed precision (AMP)",inputType:"toggle",modes:["production"],helpText:"Use mixed precision on a CUDA-capable runtime.",visibleWhen:e=>p(e)&&"cpu"!==e.device},{id:"exportInt8",label:"INT8 export",inputType:"toggle",modes:["production"],helpText:"Request INT8 calibration for supported export formats.",visibleWhen:e=>f(e)&&["engine","openvino","tflite"].includes(e.exportFormat)}]}let w={starter:{task:"train",modelSize:"nano",environment:"local",datasetYaml:"./dataset/data.yaml",sourcePath:"./sample.jpg",imageSize:"640",epochs:100,batchSize:16,device:"auto",optimizer:"auto",learningRate:.01,validationConfidence:.001,predictionConfidence:.25,weightDecay:5e-4,momentum:.937,warmupEpochs:3,freezeLayers:0,iouThreshold:.7,deterministic:!0,patience:50,workers:8,seed:42,exportFormat:"onnx",runName:"yolo_detection",projectDirectory:"./runs/detection",cacheDataset:!1,useAmp:!1,exportInt8:!1},production:{task:"train-export",modelSize:"nano",environment:"local",datasetYaml:"./dataset/data.yaml",sourcePath:"./sample.jpg",imageSize:"640",epochs:100,batchSize:16,device:"auto",optimizer:"auto",learningRate:.01,validationConfidence:.001,predictionConfidence:.25,weightDecay:5e-4,momentum:.937,warmupEpochs:3,freezeLayers:0,iouThreshold:.7,deterministic:!0,patience:50,workers:8,seed:42,exportFormat:"onnx",runName:"yolo_detection",projectDirectory:"./runs/detection",cacheDataset:!1,useAmp:!0,exportInt8:!1}};function O(e,t,m){let x=g(t),w=m[x],O=e??{},T={...b(w),...O};!Object.hasOwn(O,"predictionConfidence")&&Object.hasOwn(O,"confidenceThreshold")&&(T.predictionConfidence=O.confidenceThreshold),delete T.confidenceThreshold,T.task=y(T.task,i,w.task),T.modelSize=y(T.modelSize,a,w.modelSize),T.environment=y(T.environment,r,w.environment),T.imageSize=y(T.imageSize,o,w.imageSize),T.optimizer=y(T.optimizer,n,w.optimizer);let I=v(d[T.environment]??[],s);T.device=y(T.device,I,w.device);let z=v(c[T.environment]??[],l);for(let e of(T.exportFormat=y(T.exportFormat,z,w.exportFormat),["epochs","batchSize","learningRate","validationConfidence","predictionConfidence","weightDecay","momentum","warmupEpochs","freezeLayers","iouThreshold","patience","workers","seed"]))T[e]=function(e,t){let i="number"==typeof e?e:Number(e);return Number.isFinite(i)?i:t}(T[e],w[e]);if(T.datasetYaml=String(T.datasetYaml??"").trim(),T.sourcePath=String(T.sourcePath??"").trim(),T.runName=String(T.runName??"").trim(),T.projectDirectory=String(T.projectDirectory??"").trim(),T.cacheDataset=_(T.cacheDataset,w.cacheDataset),T.useAmp=_(T.useAmp,w.useAmp),T.exportInt8=_(T.exportInt8,w.exportInt8),T.deterministic=_(T.deterministic,w.deterministic),"starter"===x)for(let e of["epochs","batchSize","device","optimizer","learningRate","validationConfidence","predictionConfidence","weightDecay","momentum","warmupEpochs","freezeLayers","iouThreshold","deterministic","patience","workers","seed","exportFormat","runName","projectDirectory","cacheDataset","useAmp","exportInt8"])T[e]=b(w[e]);return u(T)||(T.datasetYaml=""),h(T)||(T.sourcePath=""),p(T)||(T.epochs=w.epochs,T.optimizer=w.optimizer,T.learningRate=w.learningRate,T.weightDecay=w.weightDecay,T.momentum=w.momentum,T.warmupEpochs=w.warmupEpochs,T.freezeLayers=w.freezeLayers,T.deterministic=w.deterministic,T.patience=w.patience,T.cacheDataset=!1,T.useAmp=!1),"inference"===T.task&&(T.batchSize=w.batchSize,T.workers=w.workers),"cpu"!==T.device&&p(T)||(T.useAmp=!1),"production"===x&&f(T)&&["engine","openvino","tflite"].includes(T.exportFormat)||(T.exportInt8=!1),T}function T(e,t,i,a,r,o,n={}){let s=t[i];if(!Number.isFinite(s)){e[i]=`${a} must be a number.`;return}if(n.integer&&!Number.isInteger(s)){e[i]=`${a} must be a whole number.`;return}(!n.allowMinusOne||-1!==s)&&(s<r||s>o)&&(e[i]=`${a} must be between ${r} and ${o}.`)}function I(e,t,i,a,r,o={}){let n=t[i];if(!Number.isFinite(n)){e[i]=`${a} must be a number.`;return}if(o.integer&&!Number.isInteger(n)){e[i]=`${a} must be a whole number.`;return}n<r&&(e[i]=`${a} must be at least ${r}.`)}function z(e,t){let i={},a=g(t);return u(e)&&!e.datasetYaml&&(i.datasetYaml="Dataset YAML is required for training and validation."),h(e)&&!e.sourcePath&&(i.sourcePath="An inference source path is required for this workflow."),"production"===a&&(p(e)&&(T(i,e,"epochs","Epochs",1,500,{integer:!0}),"auto"!==e.optimizer&&T(i,e,"learningRate","Learning rate",1e-6,1),I(i,e,"weightDecay","Weight decay",0),T(i,e,"momentum","Momentum",0,1),I(i,e,"warmupEpochs","Warmup epochs",0),I(i,e,"freezeLayers","Freeze layers",0,{integer:!0}),T(i,e,"patience","Patience",0,200,{integer:!0})),"inference"!==e.task&&(T(i,e,"batchSize","Batch size",1,256,{allowMinusOne:!0,integer:!0}),T(i,e,"workers","Workers",0,32,{integer:!0})),u(e)&&T(i,e,"validationConfidence","Validation confidence",0,1),h(e)&&T(i,e,"predictionConfidence","Prediction confidence",0,1),T(i,e,"iouThreshold","IoU threshold",0,1),T(i,e,"seed","Seed",0,0x7fffffff,{integer:!0}),e.projectDirectory||(i.projectDirectory="Project directory is required."),"inference"===e.task||/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(e.runName)||(i.runName="Run name may contain letters, numbers, dots, dashes, and underscores.")),i}function N(e,t,i){let a=[];return["large","extra-large"].includes(e.modelSize)&&["jetson","raspberry-pi"].includes(e.environment)&&a.push(`Large YOLO ${i} models can exceed edge-device memory or latency targets.`),Number(e.imageSize)>=960&&Number(e.batchSize)>=16&&a.push("This image-size and batch-size combination may require substantial GPU memory."),p(e)&&"cpu"===e.device&&["medium","large","extra-large"].includes(e.modelSize)&&a.push("Training this model size on CPU is likely to be very slow."),p(e)&&"auto"===e.optimizer&&a.push("Automatic optimizer selection chooses its own learning rate."),"production"===g(t)&&(e.datasetYaml?.startsWith("./dataset")||e.sourcePath?.startsWith("./sample"))&&a.push("Replace placeholder dataset and source paths before running this production-oriented script."),a}let k=[{package:"ultralytics",version:">=8.3,<9",purpose:"YOLO training, validation, inference, and export"},{package:"torch",version:">=2.3,<3",purpose:"Model execution and hardware acceleration"},{package:"numpy",version:">=1.26,<3",purpose:"Reproducible random state and numeric utilities"},{package:"PyYAML",version:">=6,<7",purpose:"Dataset YAML validation"}],C={id:"yolo-detection-training",name:"YOLO Custom Object Detection",shortDescription:"Train, validate, infer, and export a YOLOv8 detector without writing the API syntax by hand.",category:"Computer Vision",filename:()=>"train_yolo_detection.py",fields:x({defaultRunName:"yolo_detection",defaultProjectDirectory:"./runs/detection"}),defaults:w,normalize:(e,t)=>O(e,t,w),validate:z,generate:(e,t)=>P({config:e,mode:t,yoloTask:"detect",modelFilename:m[e.modelSize],outputName:"detection"}),dependencies:k,dataset:{title:"YOLO detection dataset",summary:"Images paired with normalized bounding-box label rows and described by a data.yaml file.",structure:"dataset/\n  data.yaml\n  images/{train,val,test}/\n  labels/{train,val,test}/",examplePaths:["./dataset/data.yaml","./dataset/images/train","./dataset/labels/train"],labelFormat:"class_id x_center y_center width height, normalized from 0 to 1"},metrics:["mAP50","mAP50-95","Precision","Recall","Inference latency","Exported model size"],hardware:{minimum:"Modern four-core CPU, 8 GB RAM, nano model, and a small dataset.",recommended:"NVIDIA GPU with at least 8 GB VRAM, 16 GB system RAM, and CUDA-compatible PyTorch.",edge:"Use nano or small models and benchmark the exported output on the physical target."},deployment:["ONNX","OpenVINO","TorchScript","TensorRT engine","TensorFlow Lite"],notes:["The generator intentionally targets Ultralytics 8.x and YOLOv8 weights for repeatability.","Raspberry Pi is presented as an inference or export target, not a recommended training runtime."],warnings:["Benchmark exported models with representative data on the actual deployment hardware."],getWarnings:(e,t)=>N(e,t,"detection")};function F(e){return!0===e?"True":Array.isArray(e)?`[${e.map(e=>F(e)).join(", ")}]`:!1===e?"False":null==e?"None":"number"==typeof e&&Number.isFinite(e)?String(e):JSON.stringify(String(e))}function P({config:e,mode:t,yoloTask:i,modelFilename:a,outputName:r}){return`from __future__ import annotations

import json
import random
import sys
from pathlib import Path
from typing import Any

import numpy as np
import torch
import yaml
from ultralytics import YOLO


CONFIG: dict[str, Any] = {
    "mode": ${F(g(t))},
    "yolo_task": ${F(i)},
    "workflow": ${F(e.task)},
    "dataset_yaml": ${F(e.datasetYaml)},
    "source_path": ${F(e.sourcePath)},
    "model_weights": ${F(a)},
    "epochs": ${F(e.epochs)},
    "batch_size": ${F(e.batchSize)},
    "image_size": ${F(Number(e.imageSize))},
    "device": ${F(e.device)},
    "optimizer": ${F(e.optimizer)},
${"auto"===e.optimizer?"":`    "learning_rate": ${F(e.learningRate)},
`}    "validation_confidence": ${F(e.validationConfidence)},
    "prediction_confidence": ${F(e.predictionConfidence)},
    "weight_decay": ${F(e.weightDecay)},
    "momentum": ${F(e.momentum)},
    "warmup_epochs": ${F(e.warmupEpochs)},
    "freeze_layers": ${F(e.freezeLayers)},
    "iou_threshold": ${F(e.iouThreshold)},
    "deterministic": ${F(e.deterministic)},
    "patience": ${F(e.patience)},
    "workers": ${F(e.workers)},
    "seed": ${F(e.seed)},
    "project_directory": ${F(e.projectDirectory)},
    "run_name": ${F(e.runName)},
    "cache_dataset": ${F(e.cacheDataset)},
    "use_amp": ${F(e.useAmp)},
    "export_format": ${F(e.exportFormat)},
    "export_int8": ${F(e.exportInt8)},
    "output_kind": ${F(r)},
}


def seed_everything(seed: int, deterministic: bool) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

    if hasattr(torch.backends, "cudnn"):
        torch.backends.cudnn.deterministic = deterministic
        torch.backends.cudnn.benchmark = not deterministic


def resolve_device(requested_device: str) -> str:
    if requested_device == "auto":
        return "0" if torch.cuda.is_available() else "cpu"

    if requested_device.startswith("cuda") and not torch.cuda.is_available():
        raise RuntimeError(
            f"Device {requested_device!r} was requested, but CUDA is unavailable."
        )

    if requested_device == "cuda:0":
        return "0"

    return requested_device


def validate_dataset_yaml(dataset_yaml: str) -> Path:
    path = Path(dataset_yaml).expanduser().resolve()

    if not path.is_file():
        raise FileNotFoundError(
            f"Dataset YAML was not found: {path}\\n"
            "Update CONFIG['dataset_yaml'] before running the script."
        )

    with path.open("r", encoding="utf-8") as file:
        payload = yaml.safe_load(file)

    if not isinstance(payload, dict):
        raise ValueError("Dataset YAML must contain a mapping.")

    for required_key in ("train", "val", "names"):
        if required_key not in payload:
            raise ValueError(
                f"Dataset YAML is missing required key: {required_key!r}"
            )

    return path


def validate_source_path(source_path: str) -> Path:
    path = Path(source_path).expanduser().resolve()

    if not path.exists():
        raise FileNotFoundError(f"Inference source was not found: {path}")

    return path


def load_model(weights: str) -> YOLO:
    try:
        return YOLO(weights)
    except Exception as error:
        raise RuntimeError(
            f"Could not initialize YOLO weights {weights!r}."
        ) from error


def train_model(model: YOLO, dataset_yaml: Path, device: str) -> YOLO:
    train_arguments: dict[str, Any] = dict(
        data=str(dataset_yaml),
        epochs=int(CONFIG["epochs"]),
        batch=int(CONFIG["batch_size"]),
        imgsz=int(CONFIG["image_size"]),
        device=device,
        weight_decay=float(CONFIG["weight_decay"]),
        momentum=float(CONFIG["momentum"]),
        warmup_epochs=float(CONFIG["warmup_epochs"]),
        freeze=int(CONFIG["freeze_layers"]),
        deterministic=bool(CONFIG["deterministic"]),
        patience=int(CONFIG["patience"]),
        workers=int(CONFIG["workers"]),
        seed=int(CONFIG["seed"]),
        project=str(CONFIG["project_directory"]),
        name=str(CONFIG["run_name"]),
        cache=bool(CONFIG["cache_dataset"]),
        amp=bool(CONFIG["use_amp"]),
        pretrained=True,
        exist_ok=True,
        verbose=True,
    )
    if str(CONFIG["optimizer"]) != "auto":
        train_arguments.update(
            optimizer=str(CONFIG["optimizer"]),
            lr0=float(CONFIG["learning_rate"]),
        )
    model.train(**train_arguments)

    best_weights = (
        Path(str(CONFIG["project_directory"]))
        / str(CONFIG["run_name"])
        / "weights"
        / "best.pt"
    )

    if not best_weights.is_file():
        raise FileNotFoundError(
            "Training completed, but best weights were not found: "
            f"{best_weights}"
        )

    try:
        return YOLO(str(best_weights))
    except Exception as error:
        raise RuntimeError(
            f"Could not load the best checkpoint: {best_weights}"
        ) from error


def validate_model(model: YOLO, dataset_yaml: Path, device: str) -> None:
    metrics = model.val(
        data=str(dataset_yaml),
        imgsz=int(CONFIG["image_size"]),
        batch=int(CONFIG["batch_size"]),
        device=device,
        conf=float(CONFIG["validation_confidence"]),
        iou=float(CONFIG["iou_threshold"]),
        workers=int(CONFIG["workers"]),
    )

    summary = {
        "results_dict": getattr(metrics, "results_dict", {}),
        "speed": getattr(metrics, "speed", {}),
    }

    print("Validation summary:")
    print(json.dumps(summary, indent=2, default=str))


def run_inference(model: YOLO, source_path: Path, device: str) -> None:
    results = model.predict(
        source=str(source_path),
        imgsz=int(CONFIG["image_size"]),
        conf=float(CONFIG["prediction_confidence"]),
        iou=float(CONFIG["iou_threshold"]),
        device=device,
        save=True,
        project=str(CONFIG["project_directory"]),
        name=f"{CONFIG['run_name']}_predictions",
        exist_ok=True,
    )

    speeds = [getattr(result, "speed", {}) for result in results]
    print(f"Inference completed for {len(results)} item(s).")
    print(json.dumps({"speed": speeds}, indent=2, default=str))


def export_model(model: YOLO, device: str, dataset_yaml: Path | None) -> None:
    export_arguments: dict[str, Any] = {
        "format": str(CONFIG["export_format"]),
        "imgsz": int(CONFIG["image_size"]),
        "device": device,
    }

    if bool(CONFIG["export_int8"]):
        export_arguments["int8"] = True
        if dataset_yaml is not None:
            export_arguments["data"] = str(dataset_yaml)

    exported_path = model.export(**export_arguments)
    exported_file = Path(str(exported_path)).expanduser().resolve()
    exported_size = exported_file.stat().st_size if exported_file.is_file() else None
    print(
        json.dumps(
            {
                "exported_path": str(exported_path),
                "exported_size_bytes": exported_size,
            },
            indent=2,
        )
    )


def main() -> int:
    seed_everything(int(CONFIG["seed"]), bool(CONFIG["deterministic"]))
    device = resolve_device(str(CONFIG["device"]))
    workflow = str(CONFIG["workflow"])

    project_directory = Path(str(CONFIG["project_directory"])).expanduser()
    project_directory.mkdir(parents=True, exist_ok=True)

    print("Resolved configuration:")
    print(json.dumps(CONFIG, indent=2, default=str))
    print(f"Resolved device: {device}")

    model = load_model(str(CONFIG["model_weights"]))

    dataset_yaml: Path | None = None
    if workflow in {"train", "validate", "train-export"}:
        dataset_yaml = validate_dataset_yaml(str(CONFIG["dataset_yaml"]))

    if workflow in {"train", "train-export"}:
        assert dataset_yaml is not None
        model = train_model(model, dataset_yaml, device)

    if workflow in {"train", "validate", "train-export"}:
        assert dataset_yaml is not None
        validate_model(model, dataset_yaml, device)

    source_value = str(CONFIG["source_path"]).strip()
    if source_value:
        source_path = validate_source_path(source_value)
        run_inference(model, source_path, device)

    if workflow == "train-export":
        export_model(model, device, dataset_yaml)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Execution cancelled by the user.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as error:
        print(f"Fatal error: {error}", file=sys.stderr)
        raise SystemExit(1)
`}let S={nano:"yolov8n-seg.pt",small:"yolov8s-seg.pt",medium:"yolov8m-seg.pt",large:"yolov8l-seg.pt","extra-large":"yolov8x-seg.pt"},A={starter:{...w.starter,datasetYaml:"./segmentation_dataset/data.yaml",runName:"yolo_segmentation",projectDirectory:"./runs/segmentation"},production:{...w.production,datasetYaml:"./segmentation_dataset/data.yaml",runName:"yolo_segmentation",projectDirectory:"./runs/segmentation"}},D={id:"yolo-segmentation-training",name:"YOLO Instance Segmentation",shortDescription:"Configure a YOLOv8 segmentation workflow with polygon-aware guidance and compatible exports.",category:"Computer Vision",filename:()=>"train_yolo_segmentation.py",fields:x({defaultRunName:"yolo_segmentation",defaultProjectDirectory:"./runs/segmentation"}),defaults:A,normalize:(e,t)=>O(e,t,A),validate:z,generate:(e,t)=>P({config:e,mode:t,yoloTask:"segment",modelFilename:S[e.modelSize],outputName:"segmentation"}),dependencies:k,dataset:{title:"YOLO instance-segmentation dataset",summary:"Images paired with normalized polygon annotations and described by a data.yaml file.",structure:"segmentation_dataset/\n  data.yaml\n  images/{train,val,test}/\n  labels/{train,val,test}/",examplePaths:["./segmentation_dataset/data.yaml","./segmentation_dataset/images/train","./segmentation_dataset/labels/train"],labelFormat:"class_id x1 y1 x2 y2 x3 y3 through xn yn, with normalized polygon coordinates"},metrics:["Box mAP50","Box mAP50-95","Mask mAP50","Mask mAP50-95","Precision","Recall","Inference latency","Exported model size"],hardware:{minimum:"Modern four-core CPU, 8 GB RAM, nano model, and a small polygon dataset.",recommended:"NVIDIA GPU with at least 8 GB VRAM and carefully reviewed polygon annotations.",edge:"Prefer nano or small models and profile mask decoding on the physical device."},deployment:["ONNX","OpenVINO","TorchScript","TensorRT engine","TensorFlow Lite"],notes:["Each label row contains a class ID followed by normalized polygon coordinate pairs.","Review both box and mask metrics; a good box does not guarantee an accurate mask."],warnings:["Poor polygon annotations produce poor masks even when bounding boxes look correct.","Extremely detailed polygons increase annotation and preprocessing cost.","Verify TensorRT and TensorFlow Lite exports using real segmentation outputs."],getWarnings:(e,t)=>N(e,t,"segmentation")};e.s(["YOLO_DETECTION_TEMPLATE",0,C,"YOLO_SEGMENTATION_TEMPLATE",0,D])},55979,e=>{"use strict";var t=e.i(11604),i=e.i(38717);let a=(0,t.getRecipeManifest)("yolo-segmentation-training"),r=Object.freeze({...a,...i.YOLO_SEGMENTATION_TEMPLATE,artifacts:["best.pt and last.pt checkpoints","box and mask validation metrics","segmentation prediction outputs","optional exported deployment model"],getReadiness:(e,t)=>({configuration:0===Object.keys(i.YOLO_SEGMENTATION_TEMPLATE.validate(e,t)).length?"ready":"blocked",data:e.datasetYaml?"configured":"not-required",inference:e.sourcePath?"configured":"not-required",deployment:"train-export"===e.task?"configured":"not-requested"})});e.s(["manifest",0,a,"recipe",0,r])}]);