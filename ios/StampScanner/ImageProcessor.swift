import Foundation
import UIKit
import CoreImage

@objc(ImageProcessor)
class ImageProcessor: NSObject {
  
  @objc(processStamp:withPoints:resolver:rejecter:)
  func processStamp(uri: String, points: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    
    guard let image = UIImage(contentsOfFile: uri.replacingOccurrences(of: "file://", with: "")),
          let ciImage = CIImage(image: image) else {
      reject("error", "Could not load image", nil)
      return
    }

    // Perspective Correction Filter
    let filter = CIFilter(name: "CIPerspectiveCorrection")!
    filter.setValue(ciImage, forKey: kCIInputImageKey)
    // Map detected corners to filter inputs here...
    
    if let output = filter.outputImage {
        let context = CIContext(options: nil)
        if let cgImage = context.createCGImage(output, from: output.extent) {
            let croppedImage = UIImage(cgImage: cgImage)
            // Save to temporary directory and return new URI
            let newPath = saveToDisk(image: croppedImage)
            resolve(newPath)
        }
    }
  }
}