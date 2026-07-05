import { Link } from "react-router-dom";
import { ArrowRightIcon, CompassIcon } from "../components/Icons.jsx";

export default function NotFoundPage() {
  return (
    <section className="center-page not-found-page" aria-labelledby="not-found-title">
      <div className="not-found">
        <span className="not-found-orbit" aria-hidden="true"><CompassIcon size={30} /></span>
        <span className="not-found-code">404</span>
        <h1 id="not-found-title">Trang này đã đi lạc.</h1>
        <p>Đường dẫn có thể đã thay đổi, nhưng hành trình học của bạn vẫn đang chờ phía trước.</p>
        <Link className="button" to="/">Về trang khóa học <ArrowRightIcon size={16} /></Link>
      </div>
    </section>
  );
}
