<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QrCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'qrCategory' => ['required', 'string', Rule::in(['url', 'text', 'email', 'phone', 'sms', 'vcard'])],
            'text' => ['required', 'string'],
            'size' => ['required', 'integer', 'min:200', 'max:1000'],
            'logo' => ['nullable', 'string', 'url'],
            'qrFormat' => ['nullable', 'string', Rule::in(['png', 'svg'])],
            
            // Color Parameters
            'colorDark' => ['required_without:gradient', 'string', 'regex:/^(#[0-9a-fA-F]{6}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/'],
            'backgroundColor' => ['required', 'string', 'regex:/^(#[0-9a-fA-F]{6}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/'],
            'gradient' => ['nullable', 'boolean'],
            'grdType' => ['required_if:gradient,true', 'string', Rule::in(['linear', 'upDown', 'diagonal1', 'diagonal2', 'radial'])],
            'color01' => ['required_if:gradient,true', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'color02' => ['required_if:gradient,true', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'transparentBkg' => ['nullable', 'boolean'],
            
            // Eye Customization
            'eye_color' => ['nullable', 'boolean'],
            'eye_color01' => ['required_if:eye_color,true', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'eye_color02' => ['required_if:eye_color,true', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'eye_outer' => ['nullable', 'string', 'regex:/^eyeOuter[0-9]$/'],
            'eye_inner' => ['nullable', 'string', 'regex:/^eyeInner[0-9]$/'],
            
            // Frame Parameters
            'frame' => ['nullable', 'integer', 'min:1', 'max:15'],
            'frameColor' => ['required_if:frame,!=,null', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'frameText' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'colorDark.regex' => 'The color format must be either HEX (#RRGGBB) or RGB (rgb(r,g,b))',
            'backgroundColor.regex' => 'The background color format must be either HEX (#RRGGBB) or RGB (rgb(r,g,b))',
            'eye_outer.regex' => 'The outer eye style must be in format eyeOuter[0-9]',
            'eye_inner.regex' => 'The inner eye style must be in format eyeInner[0-9]',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Set defaults if not provided
        $this->merge([
            'qrFormat' => $this->input('qrFormat', 'png'),
            'gradient' => $this->input('gradient', false),
            'transparentBkg' => $this->input('transparentBkg', false),
            'eye_color' => $this->input('eye_color', false),
        ]);
    }
}
