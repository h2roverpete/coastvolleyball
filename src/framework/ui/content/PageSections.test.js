import {act} from "react";
import {render, screen} from "@testing-library/react";
import PageSections from "./PageSections";
import {PageContext} from "./Page";

describe('PageSections', () => {
  it('should render without errors', async () => {
    // given

    // when
    await act(async () => {
      render(
        <PageSections/>
      );
    })

    // then
  })

  it('should not render child components without page data', async () => {
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
        <PageSections>
          <MockChildComponent/>
        </PageSections>
      )
    })

    // then
    const childElement = screen.queryByTestId(/MockChildComponent/i);
    expect(childElement).toBeNull();
  })

  it('should render child components when page data is available', async () => {
    // given
    const mockPageData = {PageID: 4321};
    const mockSectionData = [
      {PageSectionID: 1234},
      {PageSectionID: 1235},
    ];
    const MockChildComponent = () => {
      return (<div
        className={"MockChildComponent"}
        data-testid="MockChildComponent"
      />)
    }
    // when
    await act(async () => {
      render(
        <PageContext
          value={{
            pageId: 4321,
            pageData: mockPageData,
            sectionData: mockSectionData,
            breadcrumbs: null,
            error: null,
          }}
        >
          <PageSections>
            <MockChildComponent/>
          </PageSections>
        </PageContext>
      );
    });

    // then
    const child = screen.getByTestId(/MockChildComponent/i);
    expect(child).toBeInTheDocument();
    const section1 = screen.getByTestId(/PageSection-1234/i);
    expect(section1).toBeInTheDocument();
    const section2 = screen.getByTestId(/PageSection-1235/i);
    expect(section2).toBeInTheDocument();
  });

  it('should render page sections', async () => {
    // given
    const mockPageData = {PageID: 4321};
    const mockSectionData = [
      {PageSectionID: 1234},
      {PageSectionID: 1235},
    ];

    // when
    await act(async () => {
      render(
        <PageContext
          value={{
            pageId: 4321,
            pageData: mockPageData,
            sectionData: mockSectionData,
            breadcrumbs: null,
            error: null,
          }}
        >
          <PageSections/>
        </PageContext>
      );
    });

    // then
    const section1 = screen.getByTestId(/PageSection-1234/i);
    expect(section1).toBeInTheDocument();
    const section2 = screen.getByTestId(/PageSection-1235/i);
    expect(section2).toBeInTheDocument();
  });

});