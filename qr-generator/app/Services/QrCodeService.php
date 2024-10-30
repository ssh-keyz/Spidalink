<?php

namespace App\Services;

use App\Models\Frame;
use App\Models\Pattern;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use chillerlan\QRCode\{QRCode, QROptions};
use Exception;

class QrCodeService
{
    protected array $config;
    protected $options;
    
    public function __construct(array $config)
    {
        $this->config = $config;
        $this->options = $this->buildOptions();
    }
    
    public function generate(): array
    {
        try {
            // Generate base QR code
            $qrCode = $this->generateBaseQR();
            
            // Apply customizations
            if ($this->config['gradient'] ?? false) {
                $qrCode = $this->applyGradient($qrCode);
            }
            
            if ($this->config['eye_color'] ?? false) {
                $qrCode = $this->customizeEyes($qrCode);
            }
            
            // Add logo if specified
            if (isset($this->config['logo'])) {
                $qrCode = $this->addLogo($qrCode);
            }
            
            // Add frame if specified
            if (isset($this->config['frame'])) {
                $qrCode = $this->addFrame($qrCode);
            }
            
            // Generate final image
            $outputPath = $this->saveImage($qrCode);
            
            return [
                'success' => true,
                'data' => base64_encode(file_get_contents($outputPath)),
                'url' => basename($outputPath),
                'error' => null
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'data' => null,
                'url' => null,
                'error' => $e->getMessage()
            ];
        }
    }
    
    protected function buildOptions(): QROptions
    {
        return new QROptions([
            'version' => QRCode::VERSION_AUTO,
            'outputType' => $this->config['qrFormat'] === 'svg' ? QRCode::OUTPUT_MARKUP_SVG : QRCode::OUTPUT_IMAGE_PNG,
            'eccLevel' => QRCode::ECC_H,
            'scale' => 10,
            'imageBase64' => false,
            'bgColor' => $this->parseColor($this->config['backgroundColor']),
            'fpColor' => $this->parseColor($this->config['colorDark']),
        ]);
    }
    
    protected function generateBaseQR()
    {
        $qrCode = new QRCode($this->options);
        return $qrCode->render($this->config['text']);
    }
    
    protected function parseColor(string $color)
    {
        if (preg_match('/^#([A-Fa-f0-9]{6})$/', $color, $matches)) {
            $hex = $matches[1];
            return [
                hexdec(substr($hex, 0, 2)),
                hexdec(substr($hex, 2, 2)),
                hexdec(substr($hex, 4, 2))
            ];
        }
        
        if (preg_match('/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/', $color, $matches)) {
            return [
                (int)$matches[1],
                (int)$matches[2],
                (int)$matches[3]
            ];
        }
        
        throw new Exception('Invalid color format');
    }
    
    protected function applyGradient($image)
    {
        $img = Image::make($image);
        
        $width = $img->width();
        $height = $img->height();
        
        $gradient = Image::canvas($width, $height);
        
        $color1 = $this->parseColor($this->config['color01']);
        $color2 = $this->parseColor($this->config['color02']);
        
        switch ($this->config['grdType']) {
            case 'linear':
                for ($x = 0; $x < $width; $x++) {
                    $ratio = $x / $width;
                    $color = $this->interpolateColor($color1, $color2, $ratio);
                    $gradient->line($x, 0, $x, $height, function ($draw) use ($color) {
                        $draw->color($color);
                    });
                }
                break;
            case 'radial':
                $centerX = $width / 2;
                $centerY = $height / 2;
                $maxDistance = sqrt(pow($width/2, 2) + pow($height/2, 2));
                
                for ($y = 0; $y < $height; $y++) {
                    for ($x = 0; $x < $width; $x++) {
                        $distance = sqrt(pow($x - $centerX, 2) + pow($y - $centerY, 2));
                        $ratio = $distance / $maxDistance;
                        $color = $this->interpolateColor($color1, $color2, $ratio);
                        $gradient->pixel($color, $x, $y);
                    }
                }
                break;
            // Add other gradient types implementation
        }
        
        return $img->mask($gradient, false);
    }
    
    protected function interpolateColor($color1, $color2, $ratio)
    {
        return [
            $color1[0] + ($color2[0] - $color1[0]) * $ratio,
            $color1[1] + ($color2[1] - $color1[1]) * $ratio,
            $color1[2] + ($color2[2] - $color1[2]) * $ratio,
        ];
    }
    
    protected function customizeEyes($image)
    {
        // Implementation for eye customization
        return $image;
    }
    
    protected function addLogo($image)
    {
        $img = Image::make($image);
        $logo = Image::make($this->config['logo']);
        
        // Resize logo to 20% of QR code size
        $logoWidth = (int)($img->width() * 0.2);
        $logo->resize($logoWidth, null, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Center the logo
        $x = ($img->width() - $logo->width()) / 2;
        $y = ($img->height() - $logo->height()) / 2;
        
        return $img->insert($logo, 'top-left', (int)$x, (int)$y);
    }
    
    protected function addFrame($image)
    {
        // Implementation for adding frames
        return $image;
    }
    
    protected function saveImage($image): string
    {
        $directory = storage_path('app/public/qrcodes');
        
        // Ensure directory exists
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        $filename = time() . '.' . $this->config['qrFormat'];
        $path = $directory . '/' . $filename;
        
        if ($image instanceof \Intervention\Image\Image) {
            $image->save($path);
        } else {
            file_put_contents($path, $image);
        }
        
        return $path;
    }
}
