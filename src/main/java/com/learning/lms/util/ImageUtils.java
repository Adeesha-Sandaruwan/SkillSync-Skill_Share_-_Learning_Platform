package com.learning.lms.util;

import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class ImageUtils {

    // 600px is perfect for profile pics (Instagram uses 320px-1080px)
    private static final int TARGET_WIDTH = 600;

    public static byte[] compressImage(MultipartFile file) throws IOException {
        BufferedImage original = ImageIO.read(file.getInputStream());
        if (original == null) throw new IOException("Invalid image file");

        int originalWidth = original.getWidth();
        int originalHeight = original.getHeight();

        int newWidth = originalWidth;
        int newHeight = originalHeight;

        // Calculate new dimensions while keeping aspect ratio
        if (originalWidth > TARGET_WIDTH) {
            newWidth = TARGET_WIDTH;
            newHeight = (int) ((double) originalHeight / originalWidth * TARGET_WIDTH);
        }

        // TYPE_INT_RGB is faster for processing than ARGB
        BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();

        // SPEED OPTIMIZATION: Use Bilinear (Fast & Good) instead of Bicubic (Slow & Best)
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_DEFAULT);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g.drawImage(original, 0, 0, newWidth, newHeight, null);
        g.dispose();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        // Quality 0.9 is high enough for eyes, but saves disk space
        ImageIO.write(resized, "jpg", out);
        return out.toByteArray();
    }
}