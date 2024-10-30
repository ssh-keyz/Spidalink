import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FrameStyle {
  value: string;
  label: string;
  preview: string;
  supportedFeatures: ('color' | 'text' | 'backgroundColor' | 'borderWidth')[];
}

const frameStyles: FrameStyle[] = [
  {
    value: 'none',
    label: 'No Frame',
    preview: '/api/placeholder/100/100',
    supportedFeatures: []
  },
  {
    value: 'frame1',
    label: 'Classic Frame',
    preview: '/api/placeholder/100/100',
    supportedFeatures: ['color', 'text', 'borderWidth']
  },
  {
    value: 'frame2',
    label: 'Rounded Frame',
    preview: '/api/placeholder/100/100',
    supportedFeatures: ['color', 'text', 'backgroundColor']
  },
  // Add more frame styles here
];

interface QRPattern {
  value: string;
  label: string;
  preview: string;
}

const qrDataPatterns: QRPattern[] = [
  {
    value: 'pattern0',
    label: 'Default',
    preview: '/api/placeholder/100/100'
  },
  {
    value: 'pattern1',
    label: 'Dots',
    preview: '/api/placeholder/100/100'
  },
  {
    value: 'pattern2',
    label: 'Rounded',
    preview: '/api/placeholder/100/100'
  },
  {
    value: 'pattern3',
    label: 'Square',
    preview: '/api/placeholder/100/100'
  }
];

interface QRConfig {
  qrCategory: string;
  text: string;
  size: string;
  colorDark: string;
  backgroundColor: string;
  frame: number;
  frameText: string;
  frameColor: string;
  frameBackgroundColor: string;
  frameBorderWidth: string;
  frameTextSize: string;
  frameTextFont: string;
  framePosition: string;
  logo?: string;
  gradient: boolean;
  grdType: string;
  color01: string;
  color02: string;
  eye_color: boolean;
  eye_color01: string;
  eye_color02: string;
  eye_outer: string;
  eye_inner: string;
  qrData: string;
  qrFormat: string;
  transparentBkg: boolean;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

const gradientTypes = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' }
];

const QRCodeGenerator = () => {
  const [config, setConfig] = useState<QRConfig>({
    qrCategory: "url",
    text: "",
    size: "500",
    colorDark: "#000000",
    backgroundColor: "#ffffff",
    frame: 0,
    frameText: 'SCAN ME',
    frameColor: '#000000',
    frameBackgroundColor: '#ffffff',
    frameBorderWidth: '2',
    frameTextSize: '16',
    frameTextFont: 'Arial',
    framePosition: 'bottom',
    logo: undefined,
    gradient: false,
    grdType: 'linear',
    color01: '#000000',
    color02: '#000000',
    eye_color: false,
    eye_color01: '#000000',
    eye_color02: '#000000',
    eye_outer: 'eyeOuter0',
    eye_inner: 'eyeInner0',
    qrData: 'pattern0',
    qrFormat: 'png',
    transparentBkg: false,
  });
  
  const [qrImage, setQrImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewFrame, setPreviewFrame] = useState<FrameStyle | null>(null);

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFrameSelect = (frameValue: string) => {
    const selectedFrame = frameStyles.find(f => f.value === frameValue);
    setPreviewFrame(selectedFrame || null);
    updateConfig('frame', parseInt(frameValue, 10));
  };

  const generateQRCodeFromAPI = async (config: QRConfig): Promise<string> => {
    const payload = {
      ...config,
      frame: Math.max(1, parseInt(config.frame.toString(), 10)),
      ...(config.gradient && {
        color01: config.color01,
        color02: config.color02,
        grdType: config.grdType,
      }),
      ...(config.eye_color && {
        eye_color01: config.eye_color01,
        eye_color02: config.eye_color02,
      }),
    };

    const response = await fetch(`${API_BASE_URL}/api/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || data.error) {
      throw new Error(data.error || 'Failed to generate QR code');
    }

    // Convert the base64 data to a data URL
    return `data:image/png;base64,${data.data}`;
  };

  const generateQRCode = async () => {
    if (!config.text) {
      setError('Please enter content for the QR code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate QR code using qrcode library
      // const qrDataUrl = await QRCode.toDataURL(config.text, {
      //   width: parseInt(config.size),
      //   margin: 1,
      //   color: {
      //     dark: config.colorDark,
      //     light: config.backgroundColor
      //   }
      // });
      const qrDataUrl = await generateQRCodeFromAPI(config);
      setQrImage(qrDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code. Please try again.');
      console.error('QR Code generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Ensure frame value is at least 1
    const frameValue = Math.max(1, value);
    
    setConfig(prev => ({
        ...prev,
        frame: frameValue
    }));
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
            <div className="space-y-2">
              <Label>Content</Label>
              <Input
                value={config.text}
                onChange={(e) => updateConfig("text", e.target.value)}
                placeholder="Enter URL or text"
              />
            </div>

            <div className="space-y-2">
              <Label>QR Code Size</Label>
              <Select
                value={config.size}
                onValueChange={(v) => updateConfig("size", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {['200', '500', '1000'].map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}x{size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Frame Customization</Label>
              
              <div className="grid grid-cols-3 gap-4">
                {frameStyles.map((style) => (
                  <div
                    key={style.value}
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                      config.frame === parseInt(style.value, 10) ? 'border-primary' : 'border-muted'
                    }`}
                    onClick={() => handleFrameSelect(style.value)}
                  >
                    <img
                      src={style.preview}
                      alt={style.label}
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="mt-2 text-sm text-center">{style.label}</p>
                  </div>
                ))}
              </div>

              {previewFrame && previewFrame.value !== 'none' && (
                <div className="space-y-4">
                  {previewFrame.supportedFeatures.includes('text') && (
                    <div className="space-y-2">
                      <Label>Frame Text</Label>
                      <Input
                        value={config.frameText}
                        onChange={(e) => updateConfig('frameText', e.target.value)}
                        placeholder="Enter frame text"
                      />
                    </div>
                  )}

                  {previewFrame.supportedFeatures.includes('color') && (
                    <div className="space-y-2">
                      <Label>Frame Color</Label>
                      <Input
                        type="color"
                        value={config.frameColor}
                        onChange={(e) => updateConfig('frameColor', e.target.value)}
                      />
                    </div>
                  )}

                  {previewFrame.supportedFeatures.includes('backgroundColor') && (
                    <div className="space-y-2">
                      <Label>Frame Background</Label>
                      <Input
                        type="color"
                        value={config.frameBackgroundColor}
                        onChange={(e) => updateConfig('frameBackgroundColor', e.target.value)}
                      />
                    </div>
                  )}

                  {previewFrame.supportedFeatures.includes('borderWidth') && (
                    <div className="space-y-2">
                      <Label>Border Width</Label>
                      <Select 
                        value={config.frameBorderWidth} 
                        onValueChange={(v) => updateConfig('frameBorderWidth', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select border width" />
                        </SelectTrigger>
                        <SelectContent>
                          {['1', '2', '3', '4', '5'].map((width) => (
                            <SelectItem key={width} value={width}>
                              {width}px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Frame Position</Label>
                    <Select 
                      value={config.framePosition} 
                      onValueChange={(v) => updateConfig('framePosition', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">QR Pattern Customization</Label>
              
              <div className="space-y-2">
                <Label>QR Pattern Style</Label>
                <div className="grid grid-cols-4 gap-2">
                  {qrDataPatterns.map((pattern) => (
                    <div
                      key={pattern.value}
                      className={`cursor-pointer border-2 p-2 rounded ${
                        config.qrData === pattern.value ? 'border-primary' : 'border-muted'
                      }`}
                      onClick={() => updateConfig('qrData', pattern.value)}
                    >
                      <img src={pattern.preview} alt={pattern.label} className="w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.gradient}
                    onCheckedChange={(checked) => updateConfig('gradient', checked)}
                  />
                  <Label>Enable Gradient</Label>
                </div>
                
                {config.gradient && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Gradient Color 1</Label>
                        <Input
                          type="color"
                          value={config.color01}
                          onChange={(e) => updateConfig('color01', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Gradient Color 2</Label>
                        <Input
                          type="color"
                          value={config.color02}
                          onChange={(e) => updateConfig('color02', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Select
                      value={config.grdType}
                      onValueChange={(v) => updateConfig('grdType', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gradient type" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradientTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.eye_color}
                    onCheckedChange={(checked) => updateConfig('eye_color', checked)}
                  />
                  <Label>Customize Eye Colors</Label>
                </div>
                
                {config.eye_color && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Outer Eye Color</Label>
                      <Input
                        type="color"
                        value={config.eye_color01}
                        onChange={(e) => updateConfig('eye_color01', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Inner Eye Color</Label>
                      <Input
                        type="color"
                        value={config.eye_color02}
                        onChange={(e) => updateConfig('eye_color02', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
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
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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