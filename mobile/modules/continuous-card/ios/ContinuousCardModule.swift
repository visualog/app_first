import ExpoModulesCore

public class ContinuousCardModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ContinuousCard")

    View(ContinuousCardView.self) {
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
    }
  }
}
