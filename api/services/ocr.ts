interface OCRResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export const processImage = async (imageUrl: string): Promise<OCRResponse> => {
  void imageUrl; // Avoid unused variable warning

  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        text: 'Detected Shop Name: Tasty Burger\nRating: 4.5\nAddress: 123 Main St',
      });
    }, 1000);
  });
};
