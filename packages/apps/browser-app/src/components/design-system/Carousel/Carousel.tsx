import { type ComponentProps, useState } from "react";
import { Toolbar } from "react-aria-components";
import { PiCaretLeft, PiCaretRight, PiCircleFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import isEmpty from "../../../utils/isEmpty.js";
import IconButton from "../IconButton/IconButton.js";
import Image from "../Image/Image.js";
import * as cs from "./Carousel.css.js";

interface Props {
  images: ComponentProps<typeof Image>["image"][];
  alt: string;
  className?: string | undefined;
}
export default function Carousel({ images, alt, className }: Props) {
  const intl = useIntl();
  const [activeIndex, setActiveIndex] = useState(0);
  return !isEmpty(images) ? (
    <div className={classnames(cs.Carousel.root, className)}>
      <div className={cs.Carousel.viewport}>
        <div
          className={cs.Carousel.track}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: list is stable.
            <div key={index} className={cs.Carousel.slide}>
              <Image
                image={image}
                alt={`${alt} ${index + 1}`}
                className={cs.Carousel.image}
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 ? (
        <Toolbar
          aria-label={intl.formatMessage({ defaultMessage: "Carousel" })}
          className={cs.Carousel.controls}
        >
          <IconButton
            variant="invisible"
            label={intl.formatMessage({ defaultMessage: "Previous image" })}
            onPress={() => setActiveIndex((index) => index - 1)}
            isDisabled={activeIndex === 0}
          >
            <PiCaretLeft />
          </IconButton>
          {images.map((_, index) => (
            <IconButton
              // biome-ignore lint/suspicious/noArrayIndexKey: list is stable.
              key={index}
              variant="invisible"
              label={intl.formatMessage(
                { defaultMessage: "Go to image {number}" },
                { number: index + 1 },
              )}
              className={cs.Carousel.indicator}
              data-active={index === activeIndex}
              onPress={() => setActiveIndex(index)}
            >
              <PiCircleFill />
            </IconButton>
          ))}
          <IconButton
            variant="invisible"
            label={intl.formatMessage({ defaultMessage: "Next image" })}
            onPress={() => setActiveIndex((index) => index + 1)}
            isDisabled={activeIndex === images.length - 1}
          >
            <PiCaretRight />
          </IconButton>
        </Toolbar>
      ) : null}
    </div>
  ) : null;
}
