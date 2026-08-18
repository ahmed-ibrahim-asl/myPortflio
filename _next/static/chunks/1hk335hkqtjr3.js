(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,11604,e=>{"use strict";let t=Object.freeze(["core-configuration","data","model","training","evaluation","export"]),a=Object.freeze(["starter","production-oriented"]),n=Object.freeze(["configuration-and-seed","input-validation","data-loading","data-inspection","cleaning","preprocessing-and-augmentation","splitting-and-sampling","loader-and-batch-construction","model-construction","training-and-optimization","evaluation-and-error-analysis","export-and-artifact-summary"]);function i(e){return Object.freeze({...e,supportedDataProfileIds:Object.freeze([...e.supportedDataProfileIds]),tags:Object.freeze([...e.tags]),sourceRefs:Object.freeze([...e.sourceRefs]),pipelineStages:Object.freeze([...e.pipelineStages]),sectionIds:Object.freeze([...e.sectionIds]),presetIds:Object.freeze([...e.presetIds])})}let r=Object.freeze([i({id:"yolo-detection-training",title:"YOLO Custom Object Detection",shortDescription:"Train, validate, infer, and export a YOLOv8 detector without writing the API syntax by hand.",domainId:"computer-vision",taskId:"object-detection",supportedDataProfileIds:["yolo-detection"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLO","detection","bounding boxes","computer vision","edge export"],normalizedKeywords:"yolo custom object detection train validate infer export yolov8 bounding boxes computer vision edge ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:n,sectionIds:t,presetIds:a,generatorModuleId:"yolo-detection-training"}),i({id:"yolo-segmentation-training",title:"YOLO Instance Segmentation",shortDescription:"Configure a YOLOv8 segmentation workflow with polygon-aware guidance and compatible exports.",domainId:"computer-vision",taskId:"instance-segmentation",supportedDataProfileIds:["yolo-segmentation"],frameworkId:"ultralytics",difficulty:"intermediate",tags:["YOLO","segmentation","masks","polygons","computer vision"],normalizedKeywords:"yolo instance segmentation yolov8 masks polygons computer vision train validate infer export ultralytics",sourceRefs:["ultralytics-docs"],pipelineStages:n,sectionIds:t,presetIds:a,generatorModuleId:"yolo-segmentation-training"}),i({id:"sensor-timeseries-classification",title:"Sensor Time-Series Classification",shortDescription:"Turn ordered sensor rows into overlapping windows and train a deployable temporal classifier.",domainId:"sensor-ai",taskId:"sequence-classification",supportedDataProfileIds:["chronological-sensor-csv"],frameworkId:"pytorch",difficulty:"intermediate",tags:["sensor","time series","CNN","LSTM","fault detection","classification"],normalizedKeywords:"sensor time series classification cnn lstm fault detection chronological csv pytorch edge temporal",sourceRefs:["pytorch-docs","pytorch-deep-learning"],pipelineStages:n,sectionIds:t,presetIds:a,generatorModuleId:"sensor-timeseries-classification"}),i({id:"edge-image-classification",title:"Edge Image Classification",shortDescription:"Train a compact transfer-learning classifier and export a benchmarkable TFLite artifact.",domainId:"deployment",taskId:"edge-image-classification",supportedDataProfileIds:["class-directory-images"],frameworkId:"tensorflow",difficulty:"intermediate",tags:["image classification","edge","TensorFlow Lite","quantization","transfer learning"],normalizedKeywords:"edge image classification tensorflow keras tflite quantization transfer learning mobilenet efficientnet",sourceRefs:["tensorflow-docs","handson-ml3"],pipelineStages:n,sectionIds:t,presetIds:a,generatorModuleId:"edge-image-classification"})]);e.s(["getRecipeManifest",0,function(e){return r.find(({id:t})=>t===e)??null}])},17869,e=>{"use strict";var t=e.i(11604);let a=new Set(["starter","production"]),n=[{value:"local",label:"Local machine"},{value:"colab",label:"Google Colab"},{value:"nvidia-gpu",label:"NVIDIA GPU workstation"},{value:"jetson",label:"NVIDIA Jetson"},{value:"raspberry-pi",label:"Raspberry Pi"}],i={auto:"Auto-detect",cpu:"CPU","cuda:0":"CUDA GPU 0"},r={local:["auto","cpu"],colab:["auto","cpu","cuda:0"],"nvidia-gpu":["auto","cuda:0"],jetson:["auto","cuda:0"],"raspberry-pi":["cpu"]};function o(e){return a.has(e)?e:"starter"}function s(e,t,a){let n=new Set(t.map(e=>e.value));return n.has(String(e))?String(e):n.has(String(a))?String(a):t[0]?.value??""}function l(e){return structuredClone(e)}function d(e,t){return e.map(e=>({value:e,label:t[e]??e}))}function c(e,t,a,n,i,r,o={}){let s=t[a];if(!Number.isFinite(s)){e[a]=`${n} must be a number.`;return}if(o.integer&&!Number.isInteger(s)){e[a]=`${n} must be a whole number.`;return}(!o.allowMinusOne||-1!==s)&&(s<i||s>r)&&(e[a]=`${n} must be between ${i} and ${r}.`)}function p(e){return!0===e?"True":Array.isArray(e)?`[${e.map(e=>p(e)).join(", ")}]`:!1===e?"False":null==e?"None":"number"==typeof e&&Number.isFinite(e)?String(e):JSON.stringify(String(e))}let u=[{value:"activity-classification",label:"Activity classification"},{value:"state-classification",label:"State classification"},{value:"binary-anomaly-classification",label:"Binary anomaly classification"}],m=[{value:"cnn1d",label:"1D CNN"},{value:"lstm",label:"LSTM"},{value:"cnn-lstm",label:"CNN + LSTM"}],f=[{value:"nano",label:"Nano (32 hidden units)"},{value:"small",label:"Small (64 hidden units)"},{value:"medium",label:"Medium (128 hidden units)"},{value:"large",label:"Large (256 hidden units)"}],_={nano:32,small:64,medium:128,large:256},h=[{value:"torchscript",label:"TorchScript"},{value:"onnx",label:"ONNX"}],b={starter:{task:"activity-classification",model:"cnn1d",modelSize:"small",environment:"local",datasetPath:"./sensor_data.csv",featureColumns:"ax,ay,az,gx,gy,gz",labelColumn:"label",windowSize:128,windowStride:64,epochs:50,batchSize:64,learningRate:.001,validationFraction:.15,testFraction:.15,patience:8,dropout:.2,device:"auto",seed:42,workers:0,exportFormat:"torchscript",checkpointPath:"./artifacts/sensor_classifier.pt",sampleRateHz:100},production:{task:"activity-classification",model:"cnn1d",modelSize:"small",environment:"local",datasetPath:"./sensor_data.csv",featureColumns:"ax,ay,az,gx,gy,gz",labelColumn:"label",windowSize:128,windowStride:64,epochs:50,batchSize:64,learningRate:.001,validationFraction:.15,testFraction:.15,patience:8,dropout:.2,device:"auto",seed:42,workers:0,exportFormat:"onnx",checkpointPath:"./artifacts/sensor_classifier.pt",sampleRateHz:100}},g={id:"sensor-timeseries-classification",name:"Sensor Time-Series Classification",shortDescription:"Turn ordered sensor rows into overlapping windows and train a deployable temporal classifier.",category:"Sensor AI / Robotics",filename:()=>"train_sensor_classifier.py",fields:[{id:"task",label:"Classification task",inputType:"select",modes:["starter","production"],helpText:"Choose how labels in the ordered sensor stream should be interpreted.",options:u},{id:"model",label:"Architecture",inputType:"select",modes:["starter","production"],helpText:"Select a temporal neural-network architecture.",options:m},{id:"modelSize",label:"Model size",inputType:"select",modes:["starter","production"],helpText:"Controls the hidden width used throughout the model.",options:f},{id:"environment",label:"Runtime target",inputType:"select",modes:["starter","production"],helpText:"Filters compatible compute settings; output remains a Python script.",options:n},{id:"datasetPath",label:"Sensor CSV",inputType:"text",modes:["starter","production"],helpText:"Chronologically ordered CSV with one sensor sample per row."},{id:"featureColumns",label:"Feature columns",inputType:"text",modes:["starter","production"],helpText:"Comma-separated numeric sensor columns."},{id:"labelColumn",label:"Label column",inputType:"text",modes:["starter","production"],helpText:"Each window receives the label from its last row."},{id:"windowSize",label:"Window size",inputType:"number",modes:["starter","production"],helpText:"Number of chronological samples in one model input.",min:1,max:65536,step:1},{id:"windowStride",label:"Window stride",inputType:"number",modes:["starter","production"],helpText:"Samples advanced between overlapping windows.",min:1,max:65536,step:1},{id:"epochs",label:"Epochs",inputType:"number",modes:["production"],helpText:"Maximum training epochs.",min:1,max:500,step:1},{id:"batchSize",label:"Batch size",inputType:"number",modes:["production"],helpText:"Windows processed per optimizer step.",min:1,max:1024,step:1},{id:"learningRate",label:"Learning rate",inputType:"number",modes:["production"],helpText:"Adam optimizer learning rate.",min:1e-6,max:1,step:1e-4},{id:"validationFraction",label:"Validation fraction",inputType:"number",modes:["production"],helpText:"Chronological fraction held out before the test portion.",min:.05,max:.4,step:.01},{id:"testFraction",label:"Test fraction",inputType:"number",modes:["production"],helpText:"Final chronological fraction reserved for testing.",min:.05,max:.4,step:.01},{id:"patience",label:"Early-stop patience",inputType:"number",modes:["production"],helpText:"Epochs without validation improvement before stopping.",min:0,max:100,step:1},{id:"dropout",label:"Dropout",inputType:"number",modes:["production"],helpText:"Regularization probability in the classifier.",min:0,max:.8,step:.05},{id:"device",label:"Compute device",inputType:"select",modes:["production"],helpText:"Runtime device resolved against PyTorch availability.",getOptions:e=>d(r[e.environment]??[],i)},{id:"seed",label:"Random seed",inputType:"number",modes:["production"],helpText:"Controls deterministic splitting and training behavior.",min:0,max:0x7fffffff,step:1},{id:"workers",label:"Data workers",inputType:"number",modes:["production"],helpText:"Parallel PyTorch DataLoader workers.",min:0,max:32,step:1},{id:"exportFormat",label:"Export format",inputType:"select",modes:["production"],helpText:"Exports a fixed-window TorchScript or ONNX artifact.",options:h},{id:"checkpointPath",label:"Checkpoint path",inputType:"text",modes:["production"],helpText:"Best weights and adjacent metadata are written here."},{id:"sampleRateHz",label:"Sample rate (Hz)",inputType:"number",modes:["production"],helpText:"Recorded in metadata for downstream preprocessing.",min:1e-6,max:1e6,step:1}],defaults:b,normalize:function(e,t){let a=o(t),c=b[a],p={...l(c),...e??{}};for(let e of(p.task=s(p.task,u,c.task),p.model=s(p.model,m,c.model),p.modelSize=s(p.modelSize,f,c.modelSize),p.environment=s(p.environment,n,c.environment),p.device=s(p.device,d(r[p.environment]??[],i),c.device),p.exportFormat=s(p.exportFormat,h,c.exportFormat),["windowSize","windowStride","epochs","batchSize","learningRate","validationFraction","testFraction","patience","dropout","seed","workers","sampleRateHz"]))p[e]=function(e,t){let a="number"==typeof e?e:Number(e);return Number.isFinite(a)?a:t}(p[e],c[e]);for(let e of["datasetPath","labelColumn","checkpointPath"])p[e]=String(p[e]??"").trim();let _=Array.isArray(p.featureColumns)?p.featureColumns:String(p.featureColumns??"").split(",");if(p.featureColumns=_.map(e=>String(e).trim()).filter(Boolean).join(","),"starter"===a)for(let e of["epochs","batchSize","learningRate","validationFraction","testFraction","patience","dropout","device","seed","workers","exportFormat","checkpointPath","sampleRateHz"])p[e]=l(c[e]);return p},validate:function(e,t){let a={},n=e.featureColumns.split(",").filter(Boolean);return e.datasetPath||(a.datasetPath="Sensor CSV path is required."),0===n.length?a.featureColumns="Enter at least one feature column.":n.includes(e.labelColumn)&&(a.featureColumns="The label column cannot also be included in feature columns."),e.labelColumn||(a.labelColumn="Label column is required."),c(a,e,"windowSize","Window size",1,65536,{integer:!0}),c(a,e,"windowStride","Window stride",1,65536,{integer:!0}),a.windowStride||a.windowSize||!(e.windowStride>e.windowSize)||(a.windowStride="Window stride must be less than or equal to window size."),"production"===o(t)&&(c(a,e,"epochs","Epochs",1,500,{integer:!0}),c(a,e,"batchSize","Batch size",1,1024,{integer:!0}),c(a,e,"learningRate","Learning rate",1e-6,1),c(a,e,"validationFraction","Validation fraction",.05,.4),c(a,e,"testFraction","Test fraction",.05,.4),c(a,e,"patience","Patience",0,100,{integer:!0}),c(a,e,"dropout","Dropout",0,.8),c(a,e,"seed","Seed",0,0x7fffffff,{integer:!0}),c(a,e,"workers","Workers",0,32,{integer:!0}),c(a,e,"sampleRateHz","Sample rate",1e-6,1e6),e.validationFraction+e.testFraction>=.8&&(a.validationFraction="Validation and test fractions must total less than 0.8."),e.checkpointPath||(a.checkpointPath="Checkpoint path is required.")),a},generate:function(e,t){let a=_[e.modelSize];return`from __future__ import annotations

import json
import random
import sys
import time
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)
from torch import nn
from torch.utils.data import DataLoader, Dataset


CONFIG: dict[str, Any] = {
    "mode": ${p(o(t))},
    "task": ${p(e.task)},
    "architecture": ${p(e.model)},
    "hidden_width": ${p(a)},
    "dataset_path": ${p(e.datasetPath)},
    "feature_columns": ${p(e.featureColumns.split(","))},
    "label_column": ${p(e.labelColumn)},
    "window_size": ${p(e.windowSize)},
    "window_stride": ${p(e.windowStride)},
    "epochs": ${p(e.epochs)},
    "batch_size": ${p(e.batchSize)},
    "learning_rate": ${p(e.learningRate)},
    "validation_fraction": ${p(e.validationFraction)},
    "test_fraction": ${p(e.testFraction)},
    "patience": ${p(e.patience)},
    "dropout": ${p(e.dropout)},
    "device": ${p(e.device)},
    "seed": ${p(e.seed)},
    "workers": ${p(e.workers)},
    "export_format": ${p(e.exportFormat)},
    "checkpoint_path": ${p(e.checkpointPath)},
    "sample_rate_hz": ${p(e.sampleRateHz)},
}


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    if hasattr(torch.backends, "cudnn"):
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def resolve_device(requested: str) -> torch.device:
    if requested == "auto":
        return torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    if requested.startswith("cuda") and not torch.cuda.is_available():
        raise RuntimeError(
            f"Device {requested!r} was requested, but CUDA is unavailable."
        )
    return torch.device(requested)


def load_sensor_rows() -> tuple[np.ndarray, np.ndarray]:
    path = Path(str(CONFIG["dataset_path"])).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(
            f"Sensor CSV was not found: {path}. "
            "Update CONFIG['dataset_path'] before running the script."
        )

    frame = pd.read_csv(path)
    feature_columns = [str(name) for name in CONFIG["feature_columns"]]
    label_column = str(CONFIG["label_column"])
    required_columns = feature_columns + [label_column]
    missing_columns = [name for name in required_columns if name not in frame.columns]
    if missing_columns:
        raise ValueError(f"Sensor CSV is missing columns: {missing_columns}")
    if frame[required_columns].isnull().any().any():
        raise ValueError(
            "Sensor CSV contains missing values. Choose and apply an explicit "
            "imputation policy before using this generator."
        )

    try:
        features = frame[feature_columns].to_numpy(dtype=np.float32)
    except (TypeError, ValueError) as error:
        raise ValueError("Every configured feature column must be numeric.") from error
    labels = frame[label_column].astype(str).to_numpy()

    if str(CONFIG["task"]) == "binary-anomaly-classification":
        unique_labels = np.unique(labels)
        if len(unique_labels) != 2:
            raise ValueError(
                "Binary anomaly classification requires exactly two labels; "
                f"found {len(unique_labels)}: {unique_labels.tolist()}"
            )

    return features, labels


def build_windows(
    features: np.ndarray,
    labels: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    window_size = int(CONFIG["window_size"])
    stride = int(CONFIG["window_stride"])
    if len(features) < window_size:
        raise ValueError(
            f"Dataset has {len(features)} rows but window size is {window_size}."
        )

    windows: list[np.ndarray] = []
    window_labels: list[str] = []
    for start in range(0, len(features) - window_size + 1, stride):
        end = start + window_size
        windows.append(features[start:end])
        window_labels.append(str(labels[end - 1]))

    if len(windows) < 3:
        raise ValueError("At least three windows are required for train, validation, and test splits.")

    return np.stack(windows).astype(np.float32), np.asarray(window_labels)


def split_chronologically(
    windows: np.ndarray,
    labels: np.ndarray,
) -> tuple[
    tuple[np.ndarray, np.ndarray],
    tuple[np.ndarray, np.ndarray],
    tuple[np.ndarray, np.ndarray],
]:
    count = len(windows)
    test_count = max(1, int(round(count * float(CONFIG["test_fraction"]))))
    validation_count = max(
        1,
        int(round(count * float(CONFIG["validation_fraction"]))),
    )
    train_count = count - validation_count - test_count
    if train_count < 1:
        raise ValueError("Split fractions leave no windows for training.")

    validation_end = train_count + validation_count
    train = (windows[:train_count], labels[:train_count])
    validation = (
        windows[train_count:validation_end],
        labels[train_count:validation_end],
    )
    test = (windows[validation_end:], labels[validation_end:])
    return train, validation, test


def normalize_from_training(
    train_x: np.ndarray,
    validation_x: np.ndarray,
    test_x: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    mean = train_x.mean(axis=(0, 1), keepdims=True)
    standard_deviation = train_x.std(axis=(0, 1), keepdims=True)
    standard_deviation = np.where(standard_deviation < 1e-8, 1.0, standard_deviation)
    return (
        ((train_x - mean) / standard_deviation).astype(np.float32),
        ((validation_x - mean) / standard_deviation).astype(np.float32),
        ((test_x - mean) / standard_deviation).astype(np.float32),
        mean.reshape(-1),
        standard_deviation.reshape(-1),
    )


def encode_labels(
    train_labels: np.ndarray,
    validation_labels: np.ndarray,
    test_labels: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, list[str]]:
    classes = sorted({str(label) for label in train_labels})
    class_to_index = {label: index for index, label in enumerate(classes)}

    def encode(values: np.ndarray, split_name: str) -> np.ndarray:
        unseen = sorted({str(value) for value in values} - set(class_to_index))
        if unseen:
            raise ValueError(
                f"{split_name} contains labels absent from training data: {unseen}"
            )
        return np.asarray([class_to_index[str(value)] for value in values], dtype=np.int64)

    return (
        encode(train_labels, "Training split"),
        encode(validation_labels, "Validation split"),
        encode(test_labels, "Test split"),
        classes,
    )


class SensorDataset(Dataset):
    def __init__(self, windows: np.ndarray, labels: np.ndarray) -> None:
        self.windows = torch.from_numpy(windows).permute(0, 2, 1).contiguous()
        self.labels = torch.from_numpy(labels)

    def __len__(self) -> int:
        return len(self.windows)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        return self.windows[index], self.labels[index]


class CNN1D(nn.Module):
    def __init__(
        self,
        input_features: int,
        hidden_width: int,
        class_count: int,
        dropout: float,
    ) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv1d(input_features, hidden_width, kernel_size=5, padding=2),
            nn.BatchNorm1d(hidden_width),
            nn.ReLU(),
            nn.Conv1d(hidden_width, hidden_width, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(dropout),
            nn.Linear(hidden_width, class_count),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.classifier(self.features(inputs))


class LSTMClassifier(nn.Module):
    def __init__(
        self,
        input_features: int,
        hidden_width: int,
        class_count: int,
        dropout: float,
    ) -> None:
        super().__init__()
        self.lstm = nn.LSTM(input_features, hidden_width, batch_first=True)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden_width, class_count)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        sequence = inputs.transpose(1, 2)
        outputs, _ = self.lstm(sequence)
        return self.classifier(self.dropout(outputs[:, -1]))


class CNNLSTM(nn.Module):
    def __init__(
        self,
        input_features: int,
        hidden_width: int,
        class_count: int,
        dropout: float,
    ) -> None:
        super().__init__()
        self.convolution = nn.Sequential(
            nn.Conv1d(input_features, hidden_width, kernel_size=5, padding=2),
            nn.ReLU(),
        )
        self.lstm = nn.LSTM(hidden_width, hidden_width, batch_first=True)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden_width, class_count)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        sequence = self.convolution(inputs).transpose(1, 2)
        outputs, _ = self.lstm(sequence)
        return self.classifier(self.dropout(outputs[:, -1]))


def build_model(input_features: int, class_count: int) -> nn.Module:
    arguments = {
        "input_features": input_features,
        "hidden_width": int(CONFIG["hidden_width"]),
        "class_count": class_count,
        "dropout": float(CONFIG["dropout"]),
    }
    architecture = str(CONFIG["architecture"])
    if architecture == "cnn1d":
        return CNN1D(**arguments)
    if architecture == "lstm":
        return LSTMClassifier(**arguments)
    if architecture == "cnn-lstm":
        return CNNLSTM(**arguments)
    raise ValueError(f"Unsupported architecture: {architecture}")


def make_loader(
    windows: np.ndarray,
    labels: np.ndarray,
    shuffle: bool,
) -> DataLoader:
    return DataLoader(
        SensorDataset(windows, labels),
        batch_size=int(CONFIG["batch_size"]),
        shuffle=shuffle,
        num_workers=int(CONFIG["workers"]),
        pin_memory=torch.cuda.is_available(),
    )


def run_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    optimizer: torch.optim.Optimizer | None = None,
) -> float:
    training = optimizer is not None
    model.train(training)
    total_loss = 0.0
    total_items = 0

    for inputs, targets in loader:
        inputs = inputs.to(device)
        targets = targets.to(device)
        if training:
            optimizer.zero_grad(set_to_none=True)
        with torch.set_grad_enabled(training):
            logits = model(inputs)
            loss = criterion(logits, targets)
            if training:
                loss.backward()
                optimizer.step()
        total_loss += float(loss.item()) * len(inputs)
        total_items += len(inputs)

    if total_items == 0:
        raise RuntimeError("A data loader produced no batches.")
    return total_loss / total_items


def train_model(
    model: nn.Module,
    train_loader: DataLoader,
    validation_loader: DataLoader,
    device: torch.device,
) -> Path:
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=float(CONFIG["learning_rate"]),
    )
    checkpoint = Path(str(CONFIG["checkpoint_path"])).expanduser().resolve()
    checkpoint.parent.mkdir(parents=True, exist_ok=True)
    best_validation_loss = float("inf")
    stale_epochs = 0

    for epoch in range(1, int(CONFIG["epochs"]) + 1):
        train_loss = run_epoch(model, train_loader, criterion, device, optimizer)
        validation_loss = run_epoch(model, validation_loader, criterion, device)
        print(
            f"Epoch {epoch:03d}: train_loss={train_loss:.6f} "
            f"validation_loss={validation_loss:.6f}"
        )

        if validation_loss < best_validation_loss:
            best_validation_loss = validation_loss
            stale_epochs = 0
            torch.save(model.state_dict(), checkpoint)
        else:
            stale_epochs += 1

        patience = int(CONFIG["patience"])
        if patience > 0 and stale_epochs >= patience:
            print(f"Early stopping after {epoch} epochs.")
            break

    if not checkpoint.is_file():
        raise FileNotFoundError(f"Best checkpoint was not created: {checkpoint}")
    model.load_state_dict(torch.load(checkpoint, map_location=device, weights_only=True))
    return checkpoint


@torch.no_grad()
def predict_loader(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
) -> tuple[np.ndarray, np.ndarray]:
    model.eval()
    predictions: list[np.ndarray] = []
    targets: list[np.ndarray] = []
    for inputs, labels in loader:
        logits = model(inputs.to(device))
        predictions.append(logits.argmax(dim=1).cpu().numpy())
        targets.append(labels.numpy())
    return np.concatenate(predictions), np.concatenate(targets)


def report_metrics(
    predictions: np.ndarray,
    targets: np.ndarray,
    classes: list[str],
) -> None:
    precision, recall, _, _ = precision_recall_fscore_support(
        targets,
        predictions,
        labels=np.arange(len(classes)),
        zero_division=0,
    )
    macro_f1 = f1_score(targets, predictions, average="macro")
    summary = {
        "accuracy": accuracy_score(targets, predictions),
        "macro_f1": macro_f1,
        "per_class": {
            label: {
                "precision": float(precision[index]),
                "recall": float(recall[index]),
            }
            for index, label in enumerate(classes)
        },
        "confusion_matrix": confusion_matrix(
            targets,
            predictions,
            labels=np.arange(len(classes)),
        ).tolist(),
    }
    print("Test metrics:")
    print(json.dumps(summary, indent=2))


def measure_latency(
    model: nn.Module,
    sample: torch.Tensor,
    device: torch.device,
) -> float:
    model.eval()
    sample = sample.to(device)
    with torch.no_grad():
        for _ in range(5):
            model(sample)
        if device.type == "cuda":
            torch.cuda.synchronize()
        started = time.perf_counter()
        for _ in range(50):
            model(sample)
        if device.type == "cuda":
            torch.cuda.synchronize()
    return (time.perf_counter() - started) * 1000.0 / 50.0


def export_model(model: nn.Module, example: torch.Tensor, checkpoint: Path) -> Path:
    model = model.cpu().eval()
    example = example.cpu()
    if str(CONFIG["export_format"]) == "torchscript":
        output_path = checkpoint.with_suffix(".torchscript.pt")
        scripted = torch.jit.script(model)
        scripted.save(str(output_path))
    else:
        output_path = checkpoint.with_suffix(".onnx")
        torch.onnx.export(
            model,
            example,
            str(output_path),
            input_names=["sensor_window"],
            output_names=["class_logits"],
            dynamic_axes={"sensor_window": {0: "batch"}, "class_logits": {0: "batch"}},
            opset_version=17,
        )
    return output_path


def main() -> int:
    seed_everything(int(CONFIG["seed"]))
    device = resolve_device(str(CONFIG["device"]))
    print("Resolved configuration:")
    print(json.dumps(CONFIG, indent=2, default=str))
    print(f"Resolved device: {device}")

    features, labels = load_sensor_rows()
    windows, window_labels = build_windows(features, labels)
    train, validation, test = split_chronologically(windows, window_labels)
    train_x, train_labels = train
    validation_x, validation_labels = validation
    test_x, test_labels = test
    train_x, validation_x, test_x, mean, standard_deviation = normalize_from_training(
        train_x,
        validation_x,
        test_x,
    )
    train_y, validation_y, test_y, classes = encode_labels(
        train_labels,
        validation_labels,
        test_labels,
    )

    train_loader = make_loader(train_x, train_y, shuffle=True)
    validation_loader = make_loader(validation_x, validation_y, shuffle=False)
    test_loader = make_loader(test_x, test_y, shuffle=False)
    model = build_model(train_x.shape[2], len(classes)).to(device)
    checkpoint = train_model(model, train_loader, validation_loader, device)

    predictions, targets = predict_loader(model, test_loader, device)
    report_metrics(predictions, targets, classes)

    example = torch.from_numpy(test_x[:1]).permute(0, 2, 1).contiguous()
    latency_ms = measure_latency(model, example, device)
    export_path = export_model(model, example, checkpoint)
    artifact_size = export_path.stat().st_size

    model.eval()
    with torch.no_grad():
        sample_logits = model(example.to(device))
        sample_index = int(sample_logits.argmax(dim=1).item())

    metadata_path = checkpoint.with_suffix(".metadata.json")
    metadata = {
        "classes": classes,
        "feature_columns": CONFIG["feature_columns"],
        "window_size": CONFIG["window_size"],
        "window_stride": CONFIG["window_stride"],
        "sample_rate_hz": CONFIG["sample_rate_hz"],
        "normalization_mean": mean.tolist(),
        "normalization_standard_deviation": standard_deviation.tolist(),
        "export_path": str(export_path),
        "artifact_size_bytes": artifact_size,
        "latency_ms_per_window": latency_ms,
        "sample_prediction": classes[sample_index],
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print("Artifact summary:")
    print(json.dumps(metadata, indent=2))
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
`},dependencies:[{package:"torch",version:">=2.3,<3",purpose:"Training and export"},{package:"numpy",version:">=1.26,<3",purpose:"Windowing and normalization"},{package:"pandas",version:">=2.2,<3",purpose:"CSV loading"},{package:"scikit-learn",version:">=1.4,<2",purpose:"Metrics and labels"},{package:"onnx",version:">=1.16,<2",purpose:"ONNX export"}],dataset:{title:"Chronological sensor CSV",summary:"One time-ordered sample per row with numeric feature columns and one categorical label column.",structure:"timestamp,ax,ay,az,gx,gy,gz,label\n0.00,0.01,-0.02,9.80,0.02,0.01,-0.03,idle",examplePaths:["./sensor_data.csv"],labelFormat:"Each overlapping window uses the label from its final row."},metrics:["Accuracy","Macro F1","Per-class precision and recall","Confusion matrix","Inference latency per window","Serialized model size"],hardware:{minimum:"Four-core CPU, 4 GB RAM, and a small dataset.",recommended:"Eight-core CPU or CUDA GPU with 8 to 16 GB RAM.",edge:"Prefer a nano or small CNN, fixed windows, batch size one, and benchmark preprocessing."},deployment:["TorchScript","ONNX"],notes:["Rows must already be in chronological order; the script never shuffles before splitting.","Missing values are rejected instead of silently interpolated.","Normalization statistics are fitted only on the training windows."],warnings:[],getWarnings(e,t){let a=[];return"large"===e.modelSize&&["jetson","raspberry-pi"].includes(e.environment)&&a.push("A large temporal model may miss edge latency and memory targets."),"production"===o(t)&&e.datasetPath.startsWith("./sensor_data")&&a.push("Replace the placeholder sensor CSV path before running this production-oriented script."),a}},w=(0,t.getRecipeManifest)("sensor-timeseries-classification"),y=Object.freeze({...w,...g,artifacts:["best sensor-classifier checkpoint","class labels and normalization statistics","evaluation metrics and confusion matrix","TorchScript or ONNX deployment model"],getReadiness:(e,t)=>({configuration:0===Object.keys(g.validate(e,t)).length?"ready":"blocked",data:e.datasetPath?"configured":"blocked",chronology:"preserved",deployment:e.exportFormat?"configured":"blocked"})});e.s(["manifest",0,w,"recipe",0,y])}]);