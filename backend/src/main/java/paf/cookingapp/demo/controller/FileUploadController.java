package paf.cookingapp.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.IIOImage;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.ImageIO;
import javax.imageio.stream.ImageOutputStream;
import org.apache.commons.imaging.Imaging;
import org.apache.commons.imaging.ImageReadException;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.POST})
public class FileUploadController {
    
    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<List<String>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        try {
            if (files == null || files.length == 0) {
                logger.error("No files received");
                return ResponseEntity.badRequest().body(new ArrayList<>());
            }
            
            List<String> fileUrls = new ArrayList<>();
            Path directoryPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            
            // Always ensure directory exists
            Files.createDirectories(directoryPath);
            logger.info("Upload directory verified at: {}", directoryPath);

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    logger.warn("Empty file received");
                    continue;
                }

                String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
                if (originalFilename == null || originalFilename.contains("..")) {
                    logger.warn("Invalid filename: {}", originalFilename);
                    continue;
                }

                String extension = getFileExtension(originalFilename);
                String filename = UUID.randomUUID().toString() + "." + extension;
                Path filePath = directoryPath.resolve(filename);

                // Save the file
                try (InputStream inputStream = file.getInputStream()) {
                    Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
                    String fileUrl = "/uploads/" + filename;
                    fileUrls.add(fileUrl);
                    logger.info("Successfully saved file: {} with URL: {}", filename, fileUrl);
                } catch (IOException e) {
                    logger.error("Failed to save file: {}", filename, e);
                    continue;
                }
            }

            if (fileUrls.isEmpty()) {
                logger.warn("No files were successfully processed");
                return ResponseEntity.badRequest().body(new ArrayList<>());
            }

            return ResponseEntity.ok(fileUrls);

        } catch (Exception e) {
            logger.error("Error processing file upload", e);
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    private boolean isAcceptableContentType(String contentType) {
        return contentType != null && (
            contentType.startsWith("image/") ||
            contentType.startsWith("video/") ||
            contentType.equals("application/octet-stream")
        );
    }

    private String determineContentType(String extension) {
        switch (extension.toLowerCase()) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "mp4":
                return "video/mp4";
            default:
                return "application/octet-stream";
        }
    }

    private String getFileExtension(String filename) {
        try {
            int lastDotIndex = filename.lastIndexOf(".");
            if (lastDotIndex > 0) {
                return filename.substring(lastDotIndex + 1).toLowerCase();
            }
        } catch (Exception e) {
            logger.warn("Could not get file extension from filename: {}", filename);
        }
        return "jpg";
    }

    private void processHeicImage(MultipartFile file, String filename, List<String> fileUrls, Path directoryPath) throws IOException, ImageReadException {
        logger.info("Processing HEIC/HEIF image");
        BufferedImage image = Imaging.getBufferedImage(file.getInputStream());
        filename += ".jpg";
        Path filePath = directoryPath.resolve(filename);
        
        try (ImageOutputStream output = ImageIO.createImageOutputStream(filePath.toFile())) {
            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
            ImageWriteParam params = writer.getDefaultWriteParam();
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(0.95f);
            
            writer.setOutput(output);
            writer.write(null, new IIOImage(image, null, null), params);
            writer.dispose();
            
            fileUrls.add("/uploads/" + filename);
            logger.info("Successfully converted and saved HEIC image: {}", filename);
        }
    }

    private void processRegularImage(MultipartFile file, String filename, String originalFilename, List<String> fileUrls, Path directoryPath) throws IOException {
        String newFilename = filename + "-" + StringUtils.cleanPath(originalFilename);
        Path filePath = directoryPath.resolve(newFilename);
        
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            String fileUrl = "/uploads/" + newFilename;
            fileUrls.add(fileUrl);
            logger.info("Successfully saved image: {} with URL: {}", newFilename, fileUrl);
        } catch (IOException e) {
            logger.error("Failed to save image: {}", newFilename, e);
            throw e;
        }
    }

    private void processVideo(MultipartFile file, String filename, String originalFilename, List<String> fileUrls, Path directoryPath) throws IOException {
        filename += "-" + StringUtils.cleanPath(originalFilename);
        Path filePath = directoryPath.resolve(filename);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            fileUrls.add("/uploads/" + filename);
            logger.info("Successfully saved video: {}", filename);
        }
    }
}
