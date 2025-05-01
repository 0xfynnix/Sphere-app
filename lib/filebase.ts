import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
// 允许的文件类型
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
// 文件大小限制：5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  url: string;
  cid: string;
}

export interface UploadOptions {
  bucket: string;
  prefix?: string;
}

// 创建 S3 客户端
const createS3Client = () => {
  if (process.env.USE_FILEBASE !== "true") {
    return null;
  }

  const client = new S3({
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.FILEBASE_ACCESS_KEY!,
      secretAccessKey: process.env.FILEBASE_SECRET_KEY!,
    },
  });

  return client;
};

const s3Client = createS3Client();

/**
 * 检查服务是否启用
 */
export const isServiceEnabled = (): boolean => {
  return process.env.USE_FILEBASE === "true";
};

/**
 * 上传图片到 Filebase IPFS
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  if (!isServiceEnabled()) {
    throw new Error("Filebase service is not enabled");
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 5MB");
  }

  // 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type. Please use JPG, PNG, GIF or WebP");
  }

  try {
    // 生成唯一的文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop();
    const key = `${options.prefix || ""}${timestamp}-${random}.${extension}`;

    // 将文件转换为 Buffer
    const buffer = await file.arrayBuffer();

    // 上传到 Filebase
    // const command = {
    //   Bucket: options.bucket,
    //   Key: key,
    //   Body: Buffer.from(buffer),
    //   ContentType: file.type,
    //   Metadata: { import: 'ipfs' },
    // };

    // const request = s3Client!.putObject(command);
    // console.log('request', request);

    // // const cid = response.Metadata.cid;
    // // console.log('cid', cid);
    // request.on('httpHeaders', (statusCode: any, headers: any) => {
    //   console.log(`CID: ${headers['x-amz-meta-cid']}`);
    //   const cid = headers['x-amz-meta-cid'];
    //   if (!cid) {
    //     throw new Error('Failed to get CID from Filebase response');

    //   }

    //   // 构建 IPFS URL
    //   const url = `https://ipfs.filebase.io/ipfs/${cid}`;

    //   return {
    //     url,
    //     cid,
    //   };
    // });
    // request.send();

    const command = new PutObjectCommand({
      Bucket: options.bucket,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      Metadata: { import: "ipfs" },
    });
    let cid: string | undefined;
    command.middlewareStack.add(
      (next) => async (args) => {
        const response = await next(args);
        const httpResponse = (response as unknown as { response: { statusCode: number; headers: Record<string, string> } }).response;
        if (!httpResponse?.statusCode) return response;

        cid = httpResponse.headers["x-amz-meta-cid"];
        return response;
      },
      {
        step: "build",
        name: "addCidToOutput",
      }
    );

    await s3Client!.send(command);
    
    console.log("cid", cid);
    if (!cid) {
      throw new Error("Failed to get CID from Filebase response");
    }

    // 构建 IPFS URL
    const url = `https://ipfs.filebase.io/ipfs/${cid}`;
    console.log("url", url);
    return {
      url,
      cid,
    };
  } catch (error) {
    console.error("Error uploading to Filebase:", error);
    throw new Error("Failed to upload to Filebase");
  }
};
