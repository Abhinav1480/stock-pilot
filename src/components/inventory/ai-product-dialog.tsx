"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UploadCloud,
  FileImage,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Sparkles,
  Check,
  AlertCircle,
  TrendingUp,
  FileText,
  User,
  Plus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AiAddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "UPLOAD" | "EDIT" | "PROCESSING" | "REVIEW";

export function AiAddProductDialog({ open, onOpenChange }: AiAddProductDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sourceType, setSourceType] = useState<"IMAGE" | "INVOICE" | "BARCODE">("IMAGE");

  // Image manipulation states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isCropping, setIsCropping] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 }); // Percentage-based

  // AI Thinking state simulation
  const [thinkingMessage, setThinkingMessage] = useState("Analyzing upload...");
  const [extractedData, setExtractedData] = useState<any>(null);

  // Review states
  const [editedProducts, setEditedProducts] = useState<any[]>([]);
  const [editedInvoice, setEditedInvoice] = useState<any>(null);
  const [selectedProductIndexes, setSelectedProductIndexes] = useState<number[]>([]);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      // Reset state on close
      setStep("UPLOAD");
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setUploadProgress(0);
      setZoom(1);
      setRotation(0);
      setIsCropping(false);
      setExtractedData(null);
      setEditedProducts([]);
      setEditedInvoice(null);
    }
  }, [open]);

  // Simulate AI Thinking stages
  useEffect(() => {
    if (step !== "PROCESSING") return;
    const stages = [
      "Uploading document safely...",
      "Analyzing image visual components...",
      "Running OCR text extraction...",
      "Locating barcode and SKU markers...",
      "Analyzing product packaging elements...",
      "Matching suppliers and unit details...",
      "Structuring response JSON...",
    ];
    let index = 0;
    setThinkingMessage(stages[0]);
    const interval = setInterval(() => {
      index++;
      if (index < stages.length) {
        setThinkingMessage(stages[index]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Max size is 10MB.");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep("EDIT");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(droppedFile.type)) {
        toast.error("Invalid file type. Please upload PNG, JPG, or WEBP.");
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Max size is 10MB.");
        return;
      }
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setStep("EDIT");
    }
  };

  // Perform rotation & crop using Canvas
  const processImageAndUpload = async () => {
    if (!file || !imageRef.current) return;

    setStep("PROCESSING");
    setUploadProgress(10);

    const img = new Image();
    img.src = previewUrl;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Adjust dimensions for rotation
      const is90or270 = rotation === 90 || rotation === 270;
      const width = is90or270 ? img.height : img.width;
      const height = is90or270 ? img.width : img.height;

      canvas.width = width;
      canvas.height = height;

      // Rotate canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Handle Crop if active
      let finalCanvas = canvas;
      if (isCropping) {
        const cropCanvas = document.createElement("canvas");
        const cropCtx = cropCanvas.getContext("2d");
        if (cropCtx) {
          const cropX = (cropBox.x / 100) * canvas.width;
          const cropY = (cropBox.y / 100) * canvas.height;
          const cropW = (cropBox.w / 100) * canvas.width;
          const cropH = (cropBox.h / 100) * canvas.height;

          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          finalCanvas = cropCanvas;
        }
      }

      setUploadProgress(40);

      // Convert canvas to blob & file
      finalCanvas.toBlob(
        async (blob) => {
          if (!blob) {
            toast.error("Failed to process image.");
            setStep("EDIT");
            return;
          }

          const processedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          setUploadProgress(60);
          analyzeMutation.mutate(processedFile);
        },
        "image/jpeg",
        0.85 // Compression quality
      );
    };
  };

  const analyzeMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("sourceType", sourceType);

      const res = await fetch("/api/inventory/ai-analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to analyze image");
      }

      setUploadProgress(90);
      return res.json();
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      const resData = data.data;
      setExtractedData(resData);
      setStep("REVIEW");

      if (resData.mode === "invoice") {
        setEditedInvoice(resData.invoice);
        setEditedProducts([]);
      } else {
        setEditedProducts(resData.products || []);
        setSelectedProductIndexes(resData.products?.map((_: any, i: number) => i) || []);
        setEditedInvoice(null);
      }
      toast.success("AI Analysis complete!");
    },
    onError: (err: any) => {
      setStep("EDIT");
      toast.error(err.message || "Something went wrong during AI analysis.");
    },
  });

  // Handle single/multi product field edits
  const handleProductFieldChange = (index: number, field: string, value: any) => {
    const updated = [...editedProducts];
    updated[index] = {
      ...updated[index],
      [field]: value,
      // Clear or adjust confidence metric if manually changed
      confidence: {
        ...updated[index].confidence,
        [field]: 100, // Manual edit has 100% confidence
      },
    };
    setEditedProducts(updated);
  };

  const handleInvoiceFieldChange = (field: string, value: any) => {
    setEditedInvoice({
      ...editedInvoice,
      [field]: value,
    });
  };

  const handleInvoiceItemFieldChange = (itemIndex: number, field: string, value: any) => {
    const updatedItems = [...editedInvoice.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [field]: value,
    };
    setEditedInvoice({
      ...editedInvoice,
      items: updatedItems,
    });
  };

  // Submit imported products to PostgreSQL
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (extractedData.mode === "invoice") {
        // Save Invoice / Purchase Order
        const items = editedInvoice.items.map((item: any) => ({
          productName: item.productName,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          tax: Number(item.gst) || 0,
        }));

        const res = await fetch("/api/orders/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplierName: editedInvoice.supplierName || "AI Extracted Supplier",
            orderNumber: editedInvoice.invoiceNumber || `PO-${Date.now().toString().slice(-6)}`,
            orderDate: editedInvoice.invoiceDate || new Date().toISOString().slice(0, 10),
            items,
            tax: Number(editedInvoice.gst) || 0,
            status: "DRAFT",
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to create Purchase Order");
        }
        return res.json();
      } else {
        // Import single or multi-products
        const promises = editedProducts
          .filter((_, idx) => selectedProductIndexes.includes(idx))
          .map(async (prod) => {
            const res = await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: prod.productName,
                sku: prod.sku || `SKU-${Date.now().toString().slice(-6)}`,
                description: prod.description || "",
                sellPrice: Number(prod.price) || 0,
                costPrice: Number(prod.costPrice) || 0,
                barcode: prod.barcode || "",
                unit: prod.unit || "pcs",
                status: "ACTIVE",
                tags: prod.tags || [],
              }),
            });

            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.message || `Failed to create product: ${prod.productName}`);
            }
            return res.json();
          });

        return Promise.all(promises);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success(
        extractedData.mode === "invoice"
          ? "Draft Purchase Order created successfully!"
          : "Product(s) successfully imported to database!"
      );
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save AI-extracted products");
    },
  });

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (score >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  const getConfidenceBorder = (score: number) => {
    if (score >= 90) return "focus-visible:ring-green-500 border-green-500/30";
    if (score >= 70) return "focus-visible:ring-yellow-500 border-yellow-500/30";
    return "focus-visible:ring-red-500 border-red-500/30";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            AI Smart Product Creation
          </DialogTitle>
          <DialogDescription>
            Upload a product image, barcode, packaging, or invoice. Our AI model will extract matching details instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {step === "UPLOAD" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Source Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "IMAGE", title: "Product / Packaging", desc: "Upload a single product packaging image" },
                    { id: "BARCODE", title: "Barcode Scan", desc: "Scan a barcode or serial number label" },
                    { id: "INVOICE", title: "Invoice / Bill", desc: "Extract multiple products from purchase invoice" },
                  ].map((src) => (
                    <button
                      key={src.id}
                      onClick={() => setSourceType(src.id as any)}
                      className={cn(
                        "flex flex-col text-left p-4 rounded-xl border transition-all hover:bg-accent",
                        sourceType === src.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border/50"
                      )}
                    >
                      <span className="text-sm font-semibold">{src.title}</span>
                      <span className="text-xs text-muted-foreground mt-1 leading-snug">{src.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Drag Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-10 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer relative"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="h-12 w-12 text-muted-foreground/60 mb-4" />
                  <p className="text-sm font-medium text-foreground">Drag and drop file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PNG, JPG, JPEG, WEBP. Max size 10MB.
                  </p>
                </div>
              </motion.div>
            )}

            {step === "EDIT" && file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Visual Editor Workspace */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Image Manipulator Canvas wrapper */}
                  <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex items-center justify-center p-4 relative min-h-[350px] max-h-[450px]">
                    <div
                      ref={containerRef}
                      className="relative overflow-hidden"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: "transform 0.2s ease-out",
                      }}
                    >
                      <img
                        ref={imageRef}
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[320px] w-auto object-contain select-none pointer-events-none rounded"
                      />
                      {/* Custom Crop overlay overlay */}
                      {isCropping && (
                        <div
                          className="absolute border-2 border-primary bg-primary/10 cursor-move"
                          style={{
                            left: `${cropBox.x}%`,
                            top: `${cropBox.y}%`,
                            width: `${cropBox.w}%`,
                            height: `${cropBox.h}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Right: Controls & Sidebar */}
                  <div className="w-full lg:w-72 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Editor Tools</h4>

                      {/* Rotation Controls */}
                      <div className="space-y-2">
                        <Label className="text-xs">Rotation & Bounding</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                          >
                            <RotateCw className="h-4 w-4 mr-2" /> Rotate 90°
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-grow-0"
                            onClick={() => setIsCropping(!isCropping)}
                          >
                            <Crop className={cn("h-4 w-4", isCropping ? "text-primary" : "")} />
                          </Button>
                        </div>
                      </div>

                      {/* Zoom Controls */}
                      <div className="space-y-2">
                        <Label className="text-xs">Zoom</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <span className="text-xs font-semibold flex-1 text-center">
                            {Math.round(zoom * 100)}%
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep("UPLOAD")}>
                        Replace Image
                      </Button>
                      <Button className="flex-1" onClick={processImageAndUpload}>
                        Start AI Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "PROCESSING" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-semibold text-lg">AI Processing Engine</h3>
                  <p className="text-sm text-muted-foreground animate-pulse">{thinkingMessage}</p>
                </div>
                <div className="w-full max-w-xs">
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              </motion.div>
            )}

            {step === "REVIEW" && extractedData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Case 1: Invoice Review Flow */}
                {extractedData.mode === "invoice" && editedInvoice && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="font-semibold flex items-center gap-1.5 text-base">
                        <FileText className="h-5 w-5 text-primary" /> Invoice Extracted Metadata
                      </h3>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                        Invoice Mode
                      </Badge>
                    </div>

                    {/* Invoice Fields */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Supplier Name</Label>
                        <Input
                          value={editedInvoice.supplierName || ""}
                          onChange={(e) => handleInvoiceFieldChange("supplierName", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Invoice/Bill Number</Label>
                        <Input
                          value={editedInvoice.invoiceNumber || ""}
                          onChange={(e) => handleInvoiceFieldChange("invoiceNumber", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Invoice Date</Label>
                        <Input
                          type="date"
                          value={editedInvoice.invoiceDate || ""}
                          onChange={(e) => handleInvoiceFieldChange("invoiceDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total Amount</Label>
                        <Input
                          type="number"
                          value={editedInvoice.totalAmount || 0}
                          onChange={(e) => handleInvoiceFieldChange("totalAmount", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Invoice Items Sub-Table */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Purchased Products</Label>
                      <div className="border border-border/50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 border-b border-border/50 text-xs font-semibold text-muted-foreground">
                            <tr>
                              <th className="px-4 py-2 text-left">Product Name</th>
                              <th className="px-4 py-2 text-right w-24">Quantity</th>
                              <th className="px-4 py-2 text-right w-32">Unit Price</th>
                              <th className="px-4 py-2 text-right w-32">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {editedInvoice.items?.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-muted/20">
                                <td className="px-4 py-2">
                                  <Input
                                    value={item.productName || ""}
                                    onChange={(e) =>
                                      handleInvoiceItemFieldChange(idx, "productName", e.target.value)
                                    }
                                    className="h-8 shadow-none"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    type="number"
                                    value={item.quantity || 0}
                                    onChange={(e) =>
                                      handleInvoiceItemFieldChange(idx, "quantity", Number(e.target.value))
                                    }
                                    className="h-8 text-right shadow-none"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    type="number"
                                    value={item.unitPrice || 0}
                                    onChange={(e) =>
                                      handleInvoiceItemFieldChange(idx, "unitPrice", Number(e.target.value))
                                    }
                                    className="h-8 text-right shadow-none"
                                  />
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                  ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 2: Products Review Flow */}
                {extractedData.mode !== "invoice" && editedProducts.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="font-semibold flex items-center gap-1.5 text-base">
                        <TrendingUp className="h-5 w-5 text-primary" /> Extracted Product Specs
                      </h3>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                        {extractedData.mode === "single" ? "Single Product Mode" : "Multi-Product Mode"}
                      </Badge>
                    </div>

                    {/* Iterate over products list */}
                    {editedProducts.map((prod, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-4 rounded-xl border space-y-4 bg-muted/10 relative transition-all",
                          selectedProductIndexes.includes(idx)
                            ? "border-border"
                            : "border-border/30 opacity-60"
                        )}
                      >
                        {/* Selector (Checkbox) for Multi Mode */}
                        {extractedData.mode === "multi" && (
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <Checkbox
                              checked={selectedProductIndexes.includes(idx)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProductIndexes([...selectedProductIndexes, idx]);
                                } else {
                                  setSelectedProductIndexes(
                                    selectedProductIndexes.filter((i) => i !== idx)
                                  );
                                }
                              }}
                            />
                            <span className="text-xs font-semibold">Select Product {idx + 1}</span>
                          </div>
                        )}

                        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", extractedData.mode === "multi" ? "pt-6" : "")}>
                          {/* Left: Basic Info */}
                          <div className="space-y-3 md:col-span-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <Label className="text-xs flex items-center gap-1.5 justify-between">
                                  Product Name
                                  {prod.confidence?.productName && (
                                    <Badge
                                      variant="outline"
                                      className={cn("text-[9px] py-0", getConfidenceColor(prod.confidence.productName))}
                                    >
                                      {prod.confidence.productName}% Match
                                    </Badge>
                                  )}
                                </Label>
                                <Input
                                  value={prod.productName || ""}
                                  onChange={(e) =>
                                    handleProductFieldChange(idx, "productName", e.target.value)
                                  }
                                  className={cn("mt-1.5", getConfidenceBorder(prod.confidence?.productName || 100))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs flex items-center gap-1.5 justify-between">
                                  Brand
                                  {prod.confidence?.brand && (
                                    <Badge
                                      variant="outline"
                                      className={cn("text-[9px] py-0", getConfidenceColor(prod.confidence.brand))}
                                    >
                                      {prod.confidence.brand}% Match
                                    </Badge>
                                  )}
                                </Label>
                                <Input
                                  value={prod.brand || ""}
                                  onChange={(e) => handleProductFieldChange(idx, "brand", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label className="text-xs flex items-center gap-1.5 justify-between">
                                  SKU Suggestion
                                  {prod.confidence?.sku && (
                                    <Badge
                                      variant="outline"
                                      className={cn("text-[9px] py-0", getConfidenceColor(prod.confidence.sku))}
                                    >
                                      {prod.confidence.sku}% Match
                                    </Badge>
                                  )}
                                </Label>
                                <Input
                                  value={prod.sku || ""}
                                  onChange={(e) => handleProductFieldChange(idx, "sku", e.target.value)}
                                  className="mt-1.5 font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Product Description</Label>
                              <Textarea
                                value={prod.description || ""}
                                onChange={(e) => handleProductFieldChange(idx, "description", e.target.value)}
                                className="mt-1.5 h-20 resize-none"
                              />
                            </div>
                          </div>

                          {/* Right: Technical Specs & Prices */}
                          <div className="space-y-3 border-l border-border/30 pl-0 md:pl-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs flex items-center gap-1.5 justify-between">
                                  Price ($)
                                  {prod.confidence?.price && (
                                    <Badge
                                      variant="outline"
                                      className={cn("text-[9px] py-0", getConfidenceColor(prod.confidence.price))}
                                    >
                                      {prod.confidence.price}% Match
                                    </Badge>
                                  )}
                                </Label>
                                <Input
                                  type="number"
                                  value={prod.price || 0}
                                  onChange={(e) =>
                                    handleProductFieldChange(idx, "price", Number(e.target.value))
                                  }
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Cost Price ($)</Label>
                                <Input
                                  type="number"
                                  value={prod.costPrice || 0}
                                  onChange={(e) =>
                                    handleProductFieldChange(idx, "costPrice", Number(e.target.value))
                                  }
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Barcode</Label>
                                <Input
                                  value={prod.barcode || ""}
                                  onChange={(e) => handleProductFieldChange(idx, "barcode", e.target.value)}
                                  className="mt-1.5 font-mono"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Weight</Label>
                                <Input
                                  value={prod.weight || ""}
                                  onChange={(e) => handleProductFieldChange(idx, "weight", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Manufacturer</Label>
                                <Input
                                  value={prod.manufacturer || ""}
                                  onChange={(e) => handleProductFieldChange(idx, "manufacturer", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Country</Label>
                                <Input
                                  value={prod.country || ""}
                                  onChange={(e) => handleProductFieldChange(idx, "country", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-6">
                  <Button variant="outline" onClick={() => setStep("EDIT")}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Retry Analysis
                  </Button>
                  <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" /> Import Extracted Data
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple loader helper inside button
function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={cn("animate-spin", className)} />;
}
