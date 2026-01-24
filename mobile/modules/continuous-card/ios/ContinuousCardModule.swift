import ExpoModulesCore

public class ContinuousCardModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ContinuousCardModule")

    View(ContinuousCardView.self) {
      // 뷰 이름 명시적 설정 - JS에서 requireNativeViewManager('ContinuousCard')와 일치해야 함
      
      Prop("borderRadius") { (view: ContinuousCardView, prop: CGFloat) in
        view.layer.cornerRadius = prop
      }
      
      Prop("borderWidth") { (view: ContinuousCardView, prop: CGFloat) in
        view.layer.borderWidth = prop
      }
      
      Prop("borderColor") { (view: ContinuousCardView, prop: UIColor?) in
        view.layer.borderColor = prop?.cgColor
      }
      
      // 배경색을 네이티브 레이어에서도 처리하여 안쪽 여백 문제를 방지
      Prop("backgroundColor") { (view: ContinuousCardView, prop: UIColor?) in
        view.backgroundColor = prop
      }
    }.ViewName("ContinuousCard")
  }
}
