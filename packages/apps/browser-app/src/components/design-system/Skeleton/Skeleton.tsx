import ListSkeleton, {
  type Props as ListSkeletonProps,
} from "./ListSkeleton.js";
import RectangleSkeleton, {
  type Props as RectangleSkeletonProps,
} from "./RectangleSkeleton.js";

type Props =
  | ({ variant: "list" } & ListSkeletonProps)
  | ({ variant: "rectangle" } & RectangleSkeletonProps);
export default function Skeleton(props: Props) {
  switch (props.variant) {
    case "list":
      return <ListSkeleton {...props} />;
    case "rectangle":
      return <RectangleSkeleton {...props} />;
  }
}
