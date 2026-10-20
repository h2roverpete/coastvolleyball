import {act} from "react";
import {render, screen} from "@testing-library/react";
import PageTitle from "./PageTitle";
import {PageContext} from "./Page";

describe('PageTitle', () => {
  it('should render', async () => {
    // given
    const mockPageData = {
      PageID: 4321,
      PageTitle: 'Page Title',
      DisplayTitle: true,
    }

    // when
    await act(async () => {
      render(
        <PageContext
          value={{
            pageData: mockPageData,
            error: null
          }}
        >
          <PageTitle/>
        </PageContext>
      );
    })

    // then
    const element = screen.getByTestId(/PageTitle/i);
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("PageTitle");
    expect(element).toHaveTextContent("Page Title");
  })

  it('should hold place for title when showTitle is true', async () => {
    // given

    // when
    await act(async () => {
      render(
        <PageContext
          value={{
            pageData: null,
            error: null
          }}
        >
          <PageTitle showTitle={true} />
        </PageContext>
      );
    })

    // then
    const element = screen.getByTestId(/PageTitle/i);
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("PageTitle");
  })

  it('should not render when DisplayTitle is false', async () => {
    // given
    const mockPageData = {
      PageID: 4321,
      PageTitle: 'Page Title',
      DisplayTitle: false,
    }

    // when
    await act(async () => {
      render(
        <PageContext
          value={{
            pageId: 4321,
            pageData: mockPageData,
            error: null
          }}
        >
          <PageTitle/>
        </PageContext>
      );
    })

    // then
    const element = screen.queryByTestId(/PageTitle/i);
    expect(element).toBeNull();
  })

  it('should display error title when error is defined', async () => {
    // given
    const mockPageData = {
      PageID: 4321,
      PageTitle: 'Page Title',
      DisplayTitle: true,
    }
    const mockError = {
      title: 'Error Title',
      description: 'Error Description'
    }

    // when
    await act(async () => {
      render(
        <PageContext
          value={{
            pageId: 4321,
            pageData: mockPageData,
            error: mockError
          }}
        >
          <PageTitle/>
        </PageContext>
      );
    })

    // then
    const element = screen.getByTestId(/PageTitle/i);
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("PageTitle");
    expect(element).toHaveTextContent("Error Title");
  })

})