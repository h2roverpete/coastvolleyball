import {act} from "react";
import {render, screen} from "@testing-library/react";
import PageContent from "./PageContent";

describe('PageContent', () => {
  it('should render', async () => {
    // given

    // when
    await act(async () => {
      render(
        <PageContent/>
      );
    })

    // then
    const element = screen.getByTestId(/PageContent/i);
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("PageContent");
    expect(element).toHaveClass("container-fluid");
  })

  it('should render children', async () => {
    // given
    const MockChildComponent = () => {
      return (<div
        className={"MockChildComponent"}
        data-testid="MockChildComponent"
      />)
    }
    // when
    await act(async () => {
      render(
        <PageContent>
          <MockChildComponent/>
        </PageContent>
      );
    })

    // then
    const element = screen.getByTestId(/PageContent/i);
    expect(element).toBeInTheDocument();
    const childElement = screen.getByTestId(/MockChildComponent/i);
    expect(childElement).toBeInTheDocument();
  })
})