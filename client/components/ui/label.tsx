import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import styled from "@emotion/styled";

const StyledLabel = styled(LabelPrimitive.Root)`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ ...props }, ref) => (
  <StyledLabel ref={ref} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
