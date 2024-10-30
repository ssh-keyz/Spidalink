import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const QRCodeGenerator = () => {
  const [apiKey, setApiKey] = useState("");
  const [config, setConfig] = useState({
    qrCategory: "url",
    text: "",
    size: "500",
    logo: "",
    colorDark: "#5e0bf0",
    backgroundColor: "#ffffff",
    gradient: false,
    grdType: "linear",
    color01: "#5e0bf0",
    color02: "#f30505",
    eye_color: false,
    eye_color01: "#5e0bf0",
    eye_color02: "#f30505",
    eye_outer: "eyeOuter0",
    eye_inner: "eyeInner0",
    qrData: "pattern0",
    qrFormat: "png",
    transparentBkg: false,
    frame: "none", // Changed from empty string to 'none'
    frameColor: "",
    frameText: "SCAN ME",
  });

  const [qrImage, setQrImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const gradientTypes = [
    { value: "linear", label: "Left - Right" },
    { value: "upDown", label: "Top - Bottom" },
    { value: "diagonal1", label: "NW - SE" },
    { value: "diagonal2", label: "SW - NE" },
    { value: "radial", label: "Radial" },
  ];

  const sizes = [
    { value: "200", label: "Small (200x200)" },
    { value: "500", label: "Medium (500x500)" },
    { value: "1000", label: "Large (1000x1000)" },
  ];

  const patterns = Array.from({ length: 12 }, (_, i) => ({
    value: `pattern${i}`,
    label: `Pattern ${i}`,
  }));

  const eyeStyles = Array.from({ length: 10 }, (_, i) => ({
    value: `eyeOuter${i}`,
    label: `Style ${i}`,
  }));

  const frames = [
    { value: "none", label: "No Frame" }, // Changed from empty string to 'none'
    ...Array.from({ length: 15 }, (_, i) => ({
      value: `frame${i + 1}`, // Changed to string format
      label: `Frame ${i + 1}`,
    })),
  ];

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const generateQRCode = async () => {
    if (!config.text) {
      setError("Please enter content for the QR code");
      return;
    }

    if (!apiKey) {
      setError("Please enter your API key");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Convert frame value for API
      const frameNumber =
        config.frame === "none"
          ? null
          : parseInt(config.frame.replace("frame", ""));

      const response = await fetch("/api/qr/static", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...config,
          size: parseInt(config.size),
          frame: frameNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();
      setQrImage(`data:image/${config.qrFormat};base64,${data.data}`);
    } catch (err) {
      setError(
        "Failed to generate QR code. Please check your API key and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Basic settings content remains the same */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Input
                id="content"
                value={config.text}
                onChange={(e) => updateConfig("text", e.target.value)}
                placeholder="Enter URL or text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">QR Code Size</Label>
              <Select
                value={config.size}
                onValueChange={(v) => updateConfig("size", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern">QR Pattern</Label>
              <Select
                value={config.qrData}
                onValueChange={(v) => updateConfig("qrData", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {patterns.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Colors section */}
              <div className="space-y-2">
                <Label>Colors</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.gradient}
                    onCheckedChange={(v) => updateConfig("gradient", v)}
                  />
                  <Label>Enable Gradient</Label>
                </div>

                {config.gradient ? (
                  <>
                    <Select
                      value={config.grdType}
                      onValueChange={(v) => updateConfig("grdType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Gradient Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradientTypes.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="color"
                      value={config.color01}
                      onChange={(e) => updateConfig("color01", e.target.value)}
                    />
                    <Input
                      type="color"
                      value={config.color02}
                      onChange={(e) => updateConfig("color02", e.target.value)}
                    />
                  </>
                ) : (
                  <Input
                    type="color"
                    value={config.colorDark}
                    onChange={(e) => updateConfig("colorDark", e.target.value)}
                  />
                )}
              </div>

              {/* Eye styles section */}
              <div className="space-y-2">
                <Label>Eye Style</Label>
                <Select
                  value={config.eye_outer}
                  onValueChange={(v) => updateConfig("eye_outer", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Outer Eye Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {eyeStyles.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={config.eye_inner}
                  onValueChange={(v) => updateConfig("eye_inner", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inner Eye Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {eyeStyles.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frame section */}
            <div className="space-y-2">
              <Label>Frame</Label>
              <Select
                value={config.frame}
                onValueChange={(v) => updateConfig("frame", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frame" />
                </SelectTrigger>
                <SelectContent>
                  {frames.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {config.frame !== "none" && (
                <Input
                  value={config.frameText}
                  onChange={(e) => updateConfig("frameText", e.target.value)}
                  placeholder="Frame Text"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button
            onClick={generateQRCode}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate QR Code"
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
        )}

        {qrImage && !isLoading && (
          <div className="mt-6 flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow">
              <img
                src={qrImage}
                alt="Generated QR Code"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
