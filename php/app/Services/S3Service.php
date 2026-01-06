<?php

namespace App\Services;

use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class S3Service
{
    private S3Client $s3Client;
    private string $bucket;
    private string $region;

    public function __construct()
    {
        $this->bucket = config('filesystems.disks.s3.bucket');
        $this->region = config('filesystems.disks.s3.region');

        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region' => $this->region,
            'credentials' => [
                'key' => config('filesystems.disks.s3.key'),
                'secret' => config('filesystems.disks.s3.secret'),
            ],
        ]);
    }

    public function uploadImage(UploadedFile $file): string
    {
        if (!$file->isValid() || !str_starts_with($file->getMimeType(), 'image/')) {
            throw new \Exception('File must be an image', 400);
        }

        $fileExt = $file->getClientOriginalExtension() ?: 'jpg';
        $uniqueFilename = 'books/' . Str::uuid() . '.' . $fileExt;

        try {
            $this->s3Client->putObject([
                'Bucket' => $this->bucket,
                'Key' => $uniqueFilename,
                'Body' => file_get_contents($file->getRealPath()),
                'ContentType' => $file->getMimeType(),
                'ACL' => 'public-read',
            ]);

            return "https://{$this->bucket}.s3.{$this->region}.amazonaws.com/{$uniqueFilename}";
        } catch (AwsException $e) {
            throw new \Exception('Error uploading to S3: ' . $e->getMessage(), 500);
        }
    }
}

