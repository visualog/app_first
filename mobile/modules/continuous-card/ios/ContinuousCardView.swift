import ExpoModulesCore
import UIKit

class ContinuousCardView: ExpoView {
  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    
    // 명시적으로 클리핑 설정
    self.clipsToBounds = true
    self.layer.masksToBounds = true
    
    if #available(iOS 13.0, *) {
      self.layer.cornerCurve = .continuous
    }
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    // 자식 뷰들이 부모의 continuous corner에 맞춰 잘리도록 보장
    for subview in subviews {
      subview.clipsToBounds = true
    }
  }
}
